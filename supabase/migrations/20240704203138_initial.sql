
CREATE TABLE IF NOT EXISTS "public"."history" (
    "id" character varying NOT NULL,
    "sentence" character varying NOT NULL,
    "forcedTranslation" boolean NOT NULL,
    "sourceLanguage" character varying NOT NULL,
    "targetLanguage" character varying NOT NULL,
    "translate_result" "jsonb" NOT NULL,
    "translations_number" bigint DEFAULT '0'::bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    "last_translated_date" timestamp with time zone NOT NULL,
    "last_modified_date" timestamp with time zone NOT NULL,
    "starred" boolean DEFAULT false NOT NULL,
    "archived" boolean DEFAULT false NOT NULL,
    "tags" character varying[],
    "blacklisted_merge_records" character varying[],
    "user_id" "uuid" NOT NULL,
    "instances" "jsonb"
);

ALTER TABLE "public"."history" OWNER TO "postgres";

ALTER TABLE ONLY "public"."history"
    ADD CONSTRAINT "history_pkey" PRIMARY KEY ("id");

CREATE POLICY "Only Users Data" ON "public"."history" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));

ALTER TABLE "public"."history" ENABLE ROW LEVEL SECURITY;