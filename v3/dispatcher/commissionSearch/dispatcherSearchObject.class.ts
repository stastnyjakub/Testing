import { Carrier, Dispatcher, Place, User } from '@prisma/client';

import { CarrierPlace } from '@/carrier/types';
import { Point } from '@/types';
import { calculateDistance } from '@/utils';

import {
  DispatcherSearchCommission,
  DispatcherSearchCommissionLocation,
  ESuccessReasonType,
} from './commissionSearch.types';

export class DispatcherSearchObject {
  public dispatcher: Dispatcher & { places: Place[]; user: User };
  public carrier: Omit<Carrier, 'place'> & {
    place: CarrierPlace;
  };
  public commissions: DispatcherSearchCommission[] = [];

  /* Start of dispatcher search parameters */
  public isSuitableForHQSearch = true;
  public isSuitableForDispatcherSearch = true;
  public isSuitableForCommissionSearch = true;

  private startPoint: Point;
  private endPoint: Point;
  private startRadius: number;
  private endRadius: number;
  private directions: boolean;
  /* End of dispatcher search parameters */

  public lastSuccessReason:
    | {
        type: Exclude<ESuccessReasonType, 'COMMISSION'>;
        commission: undefined;
        locations: {
          longitude: number;
          latitude: number;
        }[];
      }
    | {
        type: ESuccessReasonType.COMMISSION;
        commission: DispatcherSearchCommission;
        locations: {
          longitude: number;
          latitude: number;
        }[];
      }
    | undefined = undefined;

  constructor(
    dispatcher: Dispatcher & { places: Place[]; user: User },
    carrier: Carrier,
    searchArgs: {
      startPoint: Point;
      endPoint: Point;
      startRadius: number;
      endRadius: number;
      directions: boolean;
    },
    commissions?: DispatcherSearchCommission[],
  ) {
    this.dispatcher = dispatcher;

    const { directions, endPoint, endRadius, startPoint, startRadius } = searchArgs;
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.startRadius = startRadius;
    this.endRadius = endRadius;
    this.directions = directions;

    this.carrier = {
      ...carrier,
      place: {
        city: carrier.city || undefined,
        street: carrier.street || undefined,
        country: carrier.country || undefined,
        latitude: carrier.latitude === null ? undefined : Number(carrier.latitude),
        longitude: carrier.longitude === null ? undefined : Number(carrier.longitude),
        postalCode: carrier.postalCode || undefined,
        countryCode: carrier.countryCode || undefined,
      },
    };
    commissions && (this.commissions = commissions);

    this.isSuitableForHQSearch = this.getIsSuitableForHQSearch();
    this.isSuitableForDispatcherSearch = this.getIsSuitableForDispatcherSearch();
    this.isSuitableForCommissionSearch = this.getIsSuitableForCommissionSearch();
  }

  private getFirstLoadingLocation({
    loadingLocations,
  }: DispatcherSearchCommission): DispatcherSearchCommissionLocation | null {
    if (!loadingLocations?.length) return null;

    // if all locations have no date, return the first one
    // if some locations have no date, return the smallest one with date
    const firstLoadingLocation = loadingLocations.reduce<(typeof loadingLocations)[number]>((acc, curr) => {
      if (!acc) return curr;
      if (!acc.date && curr.date) return curr;
      if (curr.date && acc.date && curr.date < acc.date) return curr;
      return acc;
    }, loadingLocations[0]);
    return firstLoadingLocation;
  }

  private getLastDischargeLocation({
    dischargeLocations,
  }: DispatcherSearchCommission): DispatcherSearchCommissionLocation | null {
    if (!dischargeLocations?.length) return null;

    // if all locations have no date, return the last one
    // if some locations have no date, return the greatest one with date
    const lastDischargeLocation = dischargeLocations.reduce<(typeof dischargeLocations)[number]>((acc, curr) => {
      if (!acc) return curr;
      if ((!acc.date && curr.date) || (!acc.date && !curr.date)) return curr;
      if (curr.date && acc.date && curr.date > acc.date) return curr;
      return acc;
    }, dischargeLocations[0]);
    return lastDischargeLocation;
  }

  private getIsSuitableForCommissionSearch() {
    if (!this.commissions || this.commissions.length === 0) return false;
    return true;
  }
  private getIsSuitableForHQSearch() {
    if (!this.carrier || !this.dispatcher) return false;
    const { latitude: carrierHqLatitude, longitude: carrierHqLongitude } = (this.carrier.place as CarrierPlace) || {};
    if (!carrierHqLatitude || !carrierHqLongitude) return false;
    return true;
  }
  private getIsSuitableForDispatcherSearch() {
    if (!this.dispatcher || !this.dispatcher.places) return false;
    return true;
  }

  /**
   * Calculate distance in kilometers between given point and carrier headquarters.
   * If dispatcher is not suitable for hq search - return null.
   * @param point
   * @returns number or null
   */
  private getDistanceFromHQ(point: Point): number | null {
    if (!this.isSuitableForHQSearch) return null;
    if (this.carrier.place.latitude === undefined || this.carrier.place.longitude === undefined) return null;

    return calculateDistance(point, {
      latitude: this.carrier.place.latitude,
      longitude: this.carrier.place.longitude,
    });
  }
  /**
   * Returns true, if commission start point is nearby carrier headquarters.
   * When directions are considered, could return true if start/end point is nearby carrier headquarters.
   * If dispatcher is not suitable for hq search - return null.
   * @returns boolean or null
   */
  public getIsNearbyHq(): boolean | null {
    if (!this.isSuitableForHQSearch) return null;

    const startPointDistance = this.getDistanceFromHQ(this.startPoint);
    if (startPointDistance === null) return null;
    if (startPointDistance <= this.startRadius) {
      this.setSuccessReason(ESuccessReasonType.HQ);
      return true;
    }

    if (this.directions) return false;

    const endPointDistance = this.getDistanceFromHQ(this.endPoint);
    if (endPointDistance === null) return null;
    if (endPointDistance <= this.endRadius) {
      this.setSuccessReason(ESuccessReasonType.HQ);
      return true;
    }

    return false;
  }

  /**
   * Calculates if start/end point is nearby at least one of dispatcher places and returns that place.
   * If directions are considered, only searches between places that are marked as given direction parameter
   * If dispatcher is not suitable for dispatcher search - return null.
   * @param direction - 'loading' or 'discharge'
   * @returns Point or null
   */
  private getPointNearbyDispatcherPlace(direction: 'loading' | 'discharge'): Point | null {
    if (!this.isSuitableForDispatcherSearch) return null;
    const point = direction === 'loading' ? this.startPoint : this.endPoint;
    const radius = direction === 'loading' ? this.startRadius : this.endRadius;

    const nearPlace = this.dispatcher.places.find(({ latitude, longitude, directionLoading, directionDischarge }) => {
      if (this.directions && !(direction === 'loading' ? directionLoading : directionDischarge)) return false;
      const distance = calculateDistance(point, {
        latitude: Number(latitude),
        longitude: Number(longitude),
      });
      return distance <= radius;
    });
    if (!nearPlace) return null;
    return {
      latitude: Number(nearPlace.latitude),
      longitude: Number(nearPlace.longitude),
    };
  }

  /**
   * Calculates if start and end point is nearby at least one of dispatcher places each
   * If directions are considered, only pairs loading places with start point and discharge places with end point
   * If dispatcher is not suitable for dispatcher search - return null.
   * @returns boolean or null
   */
  public getArePointsNearbyDispatcherPlaces(): boolean | null {
    if (!this.isSuitableForDispatcherSearch) return null;

    const isStartPointNearbyDispatcherPlace = this.getPointNearbyDispatcherPlace('loading');
    if (!isStartPointNearbyDispatcherPlace) return false;

    const isEndPointNearbyDispatcherPlace = this.getPointNearbyDispatcherPlace('discharge');
    if (!isEndPointNearbyDispatcherPlace) return false;

    this.setSuccessReason(ESuccessReasonType.DISPATCHER, [
      isStartPointNearbyDispatcherPlace,
      isEndPointNearbyDispatcherPlace,
    ]);
    return true;
  }

  /**
   * Calculates if start/end point is nearby at least one of commissions location and returns that location.
   * If directions are considered - only pairs loading places with start point and discharge places with end point
   * If dispatcher is not suitable for commission search or no point is nearby - return null.
   * @param commission - associated commission with its locations
   * @param direction - direction of search - loading or discharge
   * @returns Point or null
   */
  private getPointNearbyCommissionLocation(
    commission: DispatcherSearchCommission,
    direction: 'loading' | 'discharge',
  ): Point | null {
    if (!this.isSuitableForCommissionSearch) return null;
    const isLoading = direction === 'loading';
    const point = isLoading ? this.startPoint : this.endPoint;
    const radius = isLoading ? this.startRadius : this.endRadius;

    if (!commission || !commission.loadingLocations || !commission.dischargeLocations) return null;

    // If directions are considered, we should only search between loading or discharge locations based on the direction
    // Otherwise, we should search between all locations
    const locations = (() => {
      if (!this.directions) return [...commission.loadingLocations, ...commission.dischargeLocations];
      return isLoading ? commission.loadingLocations : commission.dischargeLocations;
    })();

    const nearPlace = locations.find(({ location }) => {
      const { latitude, longitude } = location || {};
      if (!latitude || !longitude) return false;

      const distance = calculateDistance(point, {
        latitude: Number(latitude),
        longitude: Number(longitude),
      });
      return distance <= radius;
    });

    if (!nearPlace) return null;
    return {
      latitude: Number(nearPlace.location.latitude),
      longitude: Number(nearPlace.location.longitude),
    };
  }
  /**
   * Calculates if start and end point is each nearby commissions loading location or discharge location.
   * If directions are considered, start point must be paired with loading location and end point must be paired with discharge location.
   * If dispatcher is not suitable for commission search, returns null.
   * @returns boolean or null
   */
  public getArePointsNearbyCommissionLocations(): boolean | null {
    if (!this.isSuitableForCommissionSearch) return null;
    const suitableLocations: Point[] = [];
    let suitableLocationsCommission: DispatcherSearchCommission | undefined = undefined;

    this.commissions.some((commission) => {
      const placeNearbyLoading = this.getPointNearbyCommissionLocation(commission, 'loading');
      if (!placeNearbyLoading) return false;
      const placeNearbyDischarge = this.getPointNearbyCommissionLocation(commission, 'discharge');
      if (!placeNearbyDischarge) return false;
      suitableLocations.push(placeNearbyLoading, placeNearbyDischarge);
      suitableLocationsCommission = commission;
      return true;
    });

    if (suitableLocations.length > 0 && suitableLocationsCommission) {
      this.setSuccessReason(ESuccessReasonType.COMMISSION, suitableLocations, suitableLocationsCommission);
      return true;
    }
    return false;
  }

  /**
   * Sets success reason for dispatcher search object. Contains reason type and locations that made dispatcher suitable for given type.
   * @param type - success reason type
   * @param locations - locations that made dispatcher suitable for given type
   * @param commission - commission that made dispatcher suitable for commission search type
   */
  private setSuccessReason(
    type: ESuccessReasonType.COMMISSION,
    locations: Point[],
    commission: DispatcherSearchCommission,
  ): void;
  private setSuccessReason(type: ESuccessReasonType.DISPATCHER, locations: Point[]): void;
  private setSuccessReason(type: ESuccessReasonType.HQ): void;
  private setSuccessReason(
    type: ESuccessReasonType,
    locations: Point[] = [],
    commission: DispatcherSearchCommission | undefined = undefined,
  ): void {
    if (type === ESuccessReasonType.HQ) {
      this.lastSuccessReason = {
        type,
        commission: undefined,
        locations: [],
      };
      if (this.carrier.place.latitude !== undefined && this.carrier.place.longitude !== undefined) {
        this.lastSuccessReason.locations.push({
          latitude: this.carrier.place.latitude,
          longitude: this.carrier.place.longitude,
        });
      }
      return;
    }
    if (type === ESuccessReasonType.DISPATCHER) {
      this.lastSuccessReason = {
        type,
        locations,
        commission: undefined,
      };
      return;
    }
    if (type === ESuccessReasonType.COMMISSION) {
      this.lastSuccessReason = {
        locations,
        commission,
        type: ESuccessReasonType.COMMISSION,
      };
      return;
    }
  }

  /**
   * Serializes dispatcher search object to be returned in response.
   */
  public serialize() {
    const { type: lastSuccessReasonType, commission: lastSuccessReasonCommission } = this.lastSuccessReason || {};
    return {
      id: this.dispatcher.dispatcher_id,
      name: `${this.dispatcher.user.name ?? ''} ${this.dispatcher.user.surname ?? ''}`.trim(),
      lastCommissionDate: this.commissions?.[0] ? this.getFirstLoadingLocation(this.commissions[0])?.date : null,
      lastSuccessReasonCommission: (() => {
        if (
          !this.lastSuccessReason ||
          lastSuccessReasonType !== ESuccessReasonType.COMMISSION ||
          !lastSuccessReasonCommission
        ) {
          return null;
        }
        const lastSuccessReasonCommissionFirstLocation = this.getFirstLoadingLocation(lastSuccessReasonCommission);
        const lastSuccessReasonCommissionLastDischargeLocation =
          this.getLastDischargeLocation(lastSuccessReasonCommission);

        return {
          id: lastSuccessReasonCommission.commission_id,
          number: lastSuccessReasonCommission.number,
          priceCarrier: lastSuccessReasonCommission.priceCarrier,
          loading: {
            date: lastSuccessReasonCommissionFirstLocation?.date || null,
            city: lastSuccessReasonCommissionFirstLocation?.location?.city || null,
            postalCode: lastSuccessReasonCommissionFirstLocation?.location?.postalCode || null,
          },
          discharge: {
            date: lastSuccessReasonCommissionLastDischargeLocation?.date || null,
            city: lastSuccessReasonCommissionLastDischargeLocation?.location?.city || null,
            postalCode: lastSuccessReasonCommissionLastDischargeLocation?.location?.postalCode || null,
          },
          customer: lastSuccessReasonCommission.customer?.company || null,
        };
      })(),
      carrier: {
        id: this.carrier.carrier_id,
        name: this.carrier.company,
        countryCode: this.carrier.countryCode || null,
      },
      reason: this.lastSuccessReason
        ? { ...this.lastSuccessReason, type: lastSuccessReasonType as string, commission: undefined }
        : null,
    };
  }
}
