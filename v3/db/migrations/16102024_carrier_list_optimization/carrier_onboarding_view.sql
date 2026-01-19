CREATE OR REPLACE VIEW public.carrier_onboarding
 AS
 WITH dispatchertokens AS (
         SELECT dispatcher_1.dispatcher_id,
            count(onboardingtoken.onboardingtoken_id)::integer AS tokencount
           FROM dispatcher dispatcher_1
             LEFT JOIN onboardingtoken ON onboardingtoken.dispatcher_id = dispatcher_1.dispatcher_id
          WHERE dispatcher_1.deleted = false
          GROUP BY dispatcher_1.dispatcher_id
        )
 SELECT carrier.carrier_id,
    carrier."addedBy",
    carrier.city,
    carrier.company,
    carrier."companyRegistrationNumber",
    carrier.country,
    carrier."countryCode",
    carrier."editedBy",
    carrier.note,
    carrier.email,
    carrier."firstName",
    carrier."lastName",
    carrier.phone,
    carrier.place,
    carrier."postalCode",
    carrier.qid,
    carrier.number,
    carrier.street,
    carrier."taxId",
    carrier.ts_edited,
    carrier.ts_added,
    carrier.deleted,
    count(
        CASE
            WHEN dispatcher.password IS NOT NULL THEN 1
            ELSE NULL::integer
        END)::integer AS dispatchersregistered,
    count(
        CASE
            WHEN dispatcher.password IS NULL AND dispatchertokens.tokencount > 0 THEN 1
            ELSE NULL::integer
        END)::integer AS dispatcherspending,
    count(
        CASE
            WHEN dispatcher.password IS NULL AND dispatchertokens.tokencount = 0 THEN 1
            ELSE NULL::integer
        END)::integer AS dispatchersunregistered
   FROM carrier
     LEFT JOIN dispatcher ON carrier.carrier_id = dispatcher.carrier_id
     LEFT JOIN dispatchertokens ON dispatchertokens.dispatcher_id = dispatcher.dispatcher_id
  WHERE dispatcher.deleted = false
  GROUP BY carrier.carrier_id;

ALTER TABLE public.carrier_onboarding
    OWNER TO postgres;

