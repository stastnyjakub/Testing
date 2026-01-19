import { getPlaces, updatePlaces } from '../../../v3/place/place.service';
import { createMockCarrier, deleteMockCarrier } from '../utility/carrier';
import { createMockDispatcher } from '../utility/dispatcher';
import { PlaceUpdateBody } from '../../../v3/place/place.interface';

let dispatcherId: number, carrierId: number, createPlacesData: PlaceUpdateBody, placeId1: number, placeId2: number;

beforeAll(async () => {
  try {
    const carrier = await createMockCarrier();
    carrierId = carrier.carrier_id;
    const dispatcher = await createMockDispatcher(carrierId);
    dispatcherId = dispatcher.dispatcher_id;
  } catch (e: any) {
    console.warn(e.message);
  }

  createPlacesData = {
    places: {
      toCreate: [
        {
          city: 'Praha1',
        },
        {
          city: 'Praha2',
        },
      ],
      toUpdate: [],
      toDelete: [],
    },
  };
});

afterAll(async () => {
  try {
    await deleteMockCarrier(carrierId);
  } catch (e: any) {
    console.warn(e.message);
  }
});

describe('Place service tests', () => {
  it('Should update places (create)', async () => {
    const dispatcherWithPlaces = await updatePlaces(dispatcherId, createPlacesData);
    placeId1 = dispatcherWithPlaces.place[0].place_id;
    placeId2 = dispatcherWithPlaces.place[1].place_id;

    expect(dispatcherWithPlaces).toHaveProperty('dispatcher_id', dispatcherId);
    expect(dispatcherWithPlaces).toHaveProperty('place');
    expect(dispatcherWithPlaces.place.length).toBe(2);
    expect(dispatcherWithPlaces.place[0]).toHaveProperty('city', 'Praha1');
    expect(dispatcherWithPlaces.place[1]).toHaveProperty('city', 'Praha2');
  });

  it('Should update places (create, update, delete)', async () => {
    const updateData = {
      places: {
        toCreate: [
          {
            city: 'Praha3',
          },
        ],
        toUpdate: [
          {
            place_id: placeId1,
            city: 'Praha - Updated',
          },
        ],
        toDelete: [{ place_id: placeId2 }],
      },
    };
    const dispatcherWithPlaces = await updatePlaces(dispatcherId, updateData);
    placeId1 = dispatcherWithPlaces.place[0].place_id;
    placeId2 = dispatcherWithPlaces.place[1].place_id;

    expect(dispatcherWithPlaces).toHaveProperty('dispatcher_id', dispatcherId);
    expect(dispatcherWithPlaces).toHaveProperty('place');
    expect(dispatcherWithPlaces.place.length).toBe(2);
    expect(dispatcherWithPlaces.place[0]).toHaveProperty('city', 'Praha3');
    expect(dispatcherWithPlaces.place[1]).toHaveProperty('city', 'Praha - Updated');
  });

  it('Should get places', async () => {
    const dispatcherWithPlaces = await getPlaces(dispatcherId);

    expect(dispatcherWithPlaces).toHaveProperty('dispatcher_id', dispatcherId);
    expect(dispatcherWithPlaces).toHaveProperty('place');
    expect(dispatcherWithPlaces.place.length).toBe(2);
    expect(dispatcherWithPlaces.place[0]).toHaveProperty('city', 'Praha3');
    expect(dispatcherWithPlaces.place[1]).toHaveProperty('city', 'Praha - Updated');
  });
});
