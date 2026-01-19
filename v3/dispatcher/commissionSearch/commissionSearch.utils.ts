export const getFilteredDispatchersByVehicleQuery = `
SELECT
    DISPATCHER.*,
    JSONB_AGG(ROW_TO_JSON(PLACE.*)) FILTER (WHERE PLACE.place_id IS NOT NULL) AS PLACES,
    ROW_TO_JSON(CARRIER.*) AS CARRIER,
    ROW_TO_JSON(USER.*) AS USER,
    JSONB_AGG(ROW_TO_JSON(DISPATCHER_SEARCH_COMMISSION.*)) FILTER (WHERE DISPATCHER_SEARCH_COMMISSION.commission_id IS NOT NULL) AS COMMISSIONS
FROM
    "Dispatcher" DISPATCHER
    INNER JOIN "Carrier" CARRIER ON CARRIER.CARRIER_ID = DISPATCHER.CARRIER_ID
    INNER JOIN "User" USER on USER.USER_ID = DISPATCHER.USER_ID
    LEFT JOIN PLACE ON PLACE.DISPATCHER_ID = DISPATCHER.DISPATCHER_ID
    LEFT JOIN (
        SELECT
            COMMISSION.COMMISSION_ID,
            COMMISSION."orderDate",
            COMMISSION."number",
            COMMISSION."priceCarrier",
            COMMISSION."dispatcher_id",
            JSONB_BUILD_OBJECT(
                'company', CUSTOMER.COMPANY
            ) as CUSTOMER,
            JSONB_AGG(
                JSONB_BUILD_OBJECT(
                    'date',
                    COMMISSIONDISCHARGE.DATE,
                    'location',
                    JSONB_BUILD_OBJECT(
                        'city',
                        DISCHARGE_LOCATION.CITY,
                        'postalCode',
                        DISCHARGE_LOCATION."postalCode",
                        'latitude',
                        DISCHARGE_LOCATION.LATITUDE,
                        'longitude',
                        DISCHARGE_LOCATION.LONGITUDE
                    )
                )
            ) AS "dischargeLocations",
            JSONB_AGG(
                JSONB_BUILD_OBJECT(
                    'date',
                    COMMISSIONLOADING.DATE,
                    'location',
                    JSONB_BUILD_OBJECT(
                        'city',
                        LOADING_LOCATION.CITY,
                        'postalCode',
                        LOADING_LOCATION."postalCode",
                        'latitude',
                        LOADING_LOCATION.LATITUDE,
                        'longitude',
                        LOADING_LOCATION.LONGITUDE
                    )
                )
            ) AS "loadingLocations"
        FROM
            COMMISSION
            JOIN CUSTOMER ON CUSTOMER.CUSTOMER_ID = COMMISSION.CUSTOMER_ID
            JOIN COMMISSIONDISCHARGE ON COMMISSIONDISCHARGE.COMMISSION_ID = COMMISSION.COMMISSION_ID
            JOIN COMMISSIONLOADING ON COMMISSIONLOADING.COMMISSION_ID = COMMISSION.COMMISSION_ID
            JOIN LOCATION DISCHARGE_LOCATION ON DISCHARGE_LOCATION.LOCATION_ID = COMMISSIONDISCHARGE.LOCATION_ID
            JOIN LOCATION LOADING_LOCATION ON LOADING_LOCATION.LOCATION_ID = COMMISSIONLOADING.LOCATION_ID
        GROUP BY
            COMMISSION.COMMISSION_ID,
            CUSTOMER.COMPANY
        ORDER BY
            COMMISSION."orderDate" DESC NULLS LAST
    ) DISPATCHER_SEARCH_COMMISSION ON DISPATCHER_SEARCH_COMMISSION.DISPATCHER_ID = DISPATCHER.DISPATCHER_ID
GROUP BY
    DISPATCHER.DISPATCHER_ID,
    CARRIER.*
HAVING
    DISPATCHER.DISPATCHER_ID = ANY($1::int[])
`;
