-- Database: vault

-- init.sh
-- DROP DATABASE vault;

-- CREATE DATABASE vault;

CREATE ROLE tally WITH LOGIN ENCRYPTED PASSWORD 'tempTallyPass';
CREATE ROLE adapter WITH LOGIN ENCRYPTED PASSWORD 'tempAdapterPass';

-- /sql/presetup.sql
ALTER DEFAULT PRIVILEGES REVOKE ALL ON FUNCTIONS FROM public;

--Drop the public schema completely, it will not be used.
DROP SCHEMA public CASCADE;

--Note that this is an untrusted language.
--Only superusers can create functions in untrusted languages.
--CREATE EXTENSION plpythonu;

--The api role will be the owner of the majority of the functions within the api schema. Each of
--these functions will be executed with "security definer" meaning the functions will run using the
--privileges of the api role.
CREATE ROLE api;


-- /sql/universal/schema.sql
-- The universal schema will contain all of the clinical data that has been ETL'd from the EMR.

CREATE SCHEMA universal;

-- /sql/universal/tables/state.sql
CREATE TABLE universal.state
(
  id bigserial NOT NULL,
  record_type text NOT NULL,
  record_id bigint NOT NULL,
  state text DEFAULT 'active'::text,
  effective_date timestamp without time zone,
  emr_id text,
  emr_reference text,
  CONSTRAINT state_pkey PRIMARY KEY (id)
);

ALTER TABLE universal.state OWNER TO adapter;

CREATE INDEX idx_state_record_type_effective_date
  ON universal.state
  USING btree
  (record_type COLLATE pg_catalog."default", effective_date DESC);

CREATE INDEX idx_state_state
  ON universal.state
  USING btree
  (state COLLATE pg_catalog."default");
 
-- /sql/universal/tables/clinic.sql
CREATE TABLE universal.clinic
(
  id bigserial NOT NULL,
  name text NOT NULL,
  hdc_reference text NOT NULL,
  emr_id text,
  emr_reference text,
  emr text,
  CONSTRAINT clinic_pkey PRIMARY KEY (id)
);

ALTER TABLE universal.clinic OWNER TO adapter;

-- /sql/universal/tables/practitioner.sql
CREATE TABLE universal.practitioner
(
  id bigserial NOT NULL,
  clinic_id bigint NOT NULL,
  name text,
  identifier text NOT NULL,
  identifier_type text NOT NULL,
  emr_id text,
  emr_reference text,
  CONSTRAINT practitioner_pkey PRIMARY KEY (id)
);

ALTER TABLE universal.practitioner OWNER TO adapter;

CREATE INDEX idx_practitioner_identifier_type_id
  ON universal.practitioner
  USING btree
  (identifier_type COLLATE pg_catalog."default", id);

-- /sql/universal/tables/patient.sql
CREATE TABLE universal.patient
(
  id bigserial NOT NULL,
  clinic_id bigint NOT NULL,
  emr_id text,
  emr_reference text,
  CONSTRAINT patient_pkey PRIMARY KEY (id),
  CONSTRAINT patient_clinic_id_fkey FOREIGN KEY (clinic_id)
    REFERENCES universal.clinic (id) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION
);

ALTER TABLE universal.patient OWNER TO adapter;

CREATE UNIQUE INDEX idx_patient_id
  ON universal.patient
  USING btree
  (id);

CREATE INDEX idx_patient_emr_id
  ON universal.patient
  USING btree
  (emr_id COLLATE pg_catalog."default");

ALTER TABLE universal.patient CLUSTER ON idx_patient_emr_id;


-- /sql/universal/tables/patient_practitioner.sql
CREATE TABLE universal.patient_practitioner
(
  id bigserial NOT NULL,
  patient_id bigint NOT NULL,
  practitioner_id bigint NOT NULL,
  emr_id text,
  emr_reference text,
  CONSTRAINT patient_practitioner_pkey PRIMARY KEY (id),
  CONSTRAINT patient_practitioner_patient_id_fkey FOREIGN KEY (patient_id)
      REFERENCES universal.patient (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT patient_practitioner_practitioner_id_fkey FOREIGN KEY (practitioner_id)
    REFERENCES universal.practitioner (id) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION
);

ALTER TABLE universal.patient_practitioner OWNER TO adapter;

CREATE INDEX idx_patient_practitioner_practitioner_id
  ON universal.patient_practitioner
  USING btree
  (practitioner_id);

-- /sql/universal/tables/attribute.sql
CREATE TABLE universal.attribute
(
  id numeric(6,3) NOT NULL,
  name text,
  CONSTRAINT attribute_pkey PRIMARY KEY (id)
);

ALTER TABLE universal.attribute OWNER TO adapter;

-- /sql/universal/tables/entry.sql
CREATE TABLE universal.entry
(
  id bigserial NOT NULL,
  patient_id bigint NOT NULL,
  entry_type_id int NOT NULL,
  emr_table text NOT NULL,
  emr_id text,
  emr_reference text,
  CONSTRAINT entry_pkey PRIMARY KEY (id),
  CONSTRAINT entry_patient_id_fkey FOREIGN KEY (patient_id)
    REFERENCES universal.patient (id) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION
);

ALTER TABLE universal.entry OWNER TO adapter;

CREATE INDEX idx_entry_emr_table_emr_id_id
  ON universal.entry
  USING btree
  (emr_table COLLATE pg_catalog."default", emr_id COLLATE pg_catalog."default", id);

CREATE INDEX idx_entry_emr_id
  ON universal.entry
  USING btree
  (emr_id COLLATE pg_catalog."default");

ALTER TABLE universal.entry CLUSTER ON idx_entry_emr_id;

-- /sql/universal/tables/entry_attribute.sql
CREATE TABLE universal.entry_attribute
(
  id bigserial NOT NULL,
  entry_id bigint NOT NULL,
  attribute_id numeric(6,3),
  code_system text,
  code_value text,
  text_value text,
  date_value date,
  boolean_value boolean,
  numeric_value numeric(18,6),
  emr_id text,
  emr_reference text,
  emr_effective_date timestamp without time zone,
  hdc_effective_date timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT entry_attribute_pkey PRIMARY KEY (id),
  CONSTRAINT entry_attribute_entry_id_fkey FOREIGN KEY (entry_id)
    REFERENCES universal.entry (id) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION
);

ALTER TABLE universal.entry_attribute OWNER TO adapter;

CREATE INDEX idx_entry_attribute_attribute_id
  ON universal.entry_attribute
  USING btree
  (attribute_id);

CREATE INDEX idx_entry_attribute_code_system
  ON universal.entry_attribute
  USING btree
  (lower(code_system) COLLATE pg_catalog."default");

CREATE INDEX idx_entry_attribute_code_value
  ON universal.entry_attribute
  USING btree
  (code_value COLLATE pg_catalog."default");

CREATE INDEX idx_entry_attribute_date_value
  ON universal.entry_attribute
  USING btree
  (date_value);

CREATE INDEX idx_entry_attribute_entry_id
  ON universal.entry_attribute
  USING btree
  (entry_id);


-- /sql/universal/data/attributes.sql
INSERT INTO universal.attribute (id, name) VALUES
(1.001, 'Address - Type'),
(1.002, 'Address - Street Line 1'),
(1.003, 'Address - Street Line 2 '),
(1.004, 'Address - City'),
(1.005, 'Address - Province'),
(1.006, 'Address - Postal Code'),
(1.007, 'Address - Country'),
(2.001, 'Adverse Reaction Risk - Substance'),
(2.002, 'Adverse Reaction Risk - Certainty'),
(2.003, 'Adverse Reaction Risk - Category'),
(2.004, 'Adverse Reaction Risk - Criticality'),
(2.005, 'Adverse Reaction Risk - Severity'),
(2.006, 'Adverse Reaction Risk - Manifestation'),
(2.007, 'Adverse Reaction Risk - Start Date'),
(2.008, 'Adverse Reaction Risk - Stop Date'),
(19.001, 'Barrier - Barrier'),
(19.002, 'Barrier - Start Date'),
(19.003, 'Barrier - End Date'),
(3.001, 'Billing - Service Date'),
(3.002, 'Billing - Status'),
(3.003, 'Billing - Status Date'),
(3.004, 'Billing - Service'),
(3.005, 'Billing - Diagnosis'),
(3.006, 'Billing - MSP Sequence'),
(3.007, 'Billing - MSP Reference Sequence Number'),
(6.001, 'Contact - Record Type'),
(6.002, 'Contact - Location'),
(6.003, 'Contact - Value'),
(6.004, 'Contact - Start Date'),
(6.005, 'Contact - End Date'),
(5.001, 'Demographic - Birth Date'),
(5.002, 'Demographic - Administrative Gender'),
(5.003, 'Demographic - Biological Gender'),
(5.004, 'Demographic - Preferred Gender'),
(5.005, 'Demographic - Given Name'),
(5.006, 'Demographic - Family Name'),
(5.009, 'Demographic - Marital Status'),
(5.01, 'Demographic - Race'),
(5.011, 'Demographic - Ethnicity'),
(5.012, 'Demographic - Living Arrangement'),
(5.013, 'Demographic - Education Level'),
(7.001, 'Encounter - Encounter Date'),
(7.002, 'Encounter - Reason'),
(7.003, 'Encounter - Encounter Type'),
(7.004, 'Encounter - Encounter Mode'),
(7.005, 'Encounter - Encounter Class'),
(7.006, 'Encounter - Primary Diagnosis'),
(7.007, 'Encounter - Additional Diagnosis'),
(8.001, 'Family History - Relationship'),
(8.002, 'Family History - Gender'),
(8.003, 'Family History - Diagnosis'),
(8.004, 'Family History - Severity'),
(8.005, 'Family History - Age of Onset'),
(8.006, 'Family History - Race'),
(8.007, 'Family History - Ethnicity'),
(20.001, 'Goal - Goal'),
(20.002, 'Goal - Indication'),
(20.003, 'Goal - Phase'),
(20.004, 'Goal - Patient Commitment'),
(20.005, 'Goal - Patient Confidence'),
(20.006, 'Goal - Provider Importance'),
(20.007, 'Goal - Outcome'),
(20.008, 'Goal - Start Date'),
(20.009, 'Goal - End Date'),
(17.001, 'Identifier - Identifier Type'),
(17.002, 'Identifier - Issuer'),
(17.003, 'Identifier - Identifier'),
(17.004, 'Identifier - Start Date'),
(17.005, 'Identifier - End Date'),
(16.001, 'Instruction - Requested Date'),
(16.002, 'Instruction - Completed Date'),
(16.003, 'Instruction - Reason for Instruction'),
(16.004, 'Instruction - Request Recipient'),
(16.005, 'Instruction - Service Requested'),
(16.006, 'Instruction - Priority'),
(16.007, 'Instruction - Status'),
(11.001, 'Medication Administration - Medication'),
(11.002, 'Medication Administration - Classification'),
(11.003, 'Medication Administration - Administration Date'),
(11.004, 'Medication Administration - Expiry Date'),
(11.005, 'Medication Administration - Dose'),
(11.006, 'Medication Administration - Unit of Measure'),
(11.007, 'Medication Administration - Not Given'),
(11.008, 'Medication Administration - Not Given Reason'),
(11.009, 'Medication Administration - Reaction'),
(11.01, 'Medication Administration - Admin Site'),
(11.012, 'Medication Administration - Route'),
(11.013, 'Medication Administration - Lot'),
(21.001, 'Need - Need'),
(21.002, 'Need - Start Date'),
(21.003, 'Need - End Date'),
(9.001, 'Observation - Observation'),
(9.002, 'Observation - Observation Date'),
(9.003, 'Observation - Value'),
(9.004, 'Observation - Normal Range'),
(9.005, 'Observation - Unit of Measure'),
(9.006, 'Observation - Status'),
(9.007, 'Observation - Performed By'),
(18.001, 'Occupation - Occupation'),
(18.002, 'Occupation - Start Date'),
(18.003, 'Occupation - End Date'),
(23.001, 'Preference - Preference Type'),
(23.002, 'Preference - Subject'),
(23.003, 'Preference - Instruction'),
(23.004, 'Preference - Reason'),
(23.005, 'Preference - Start Date'),
(23.006, 'Preference - End Date'),
(12.001, 'Prescription - Medication'),
(12.002, 'Prescription - Classification'),
(12.003, 'Prescription - Prescribing Provider'),
(12.004, 'Prescription - Dose Instructions'),
(12.005, 'Prescription - PRN Flag'),
(12.006, 'Prescription - Dose'),
(12.007, 'Prescription - Dose Unit of Measure'),
(12.008, 'Prescription - Start Date'),
(12.009, 'Prescription - Stop Date'),
(12.01, 'Prescription - Indication'),
(12.011, 'Prescription - Stop Reason'),
(12.012, 'Prescription - Status'),
(12.013, 'Prescription - Drug Form'),
(12.014, 'Prescription - Strength'),
(12.015, 'Prescription - Strength Unit'),
(12.016, 'Prescription - Frequency'),
(12.017, 'Prescription - Administration Route'),
(12.018, 'Prescription - Duration Count'),
(12.019, 'Prescription - Duration Unit'),
(12.02, 'Prescription - Dispense Quantity'),
(12.021, 'Prescription - Refill Count'),
(14.001, 'Problem - Problem'),
(14.002, 'Problem - Onset Date'),
(14.003, 'Problem - Resolution Date'),
(14.004, 'Problem - Diagnostic Stage'),
(14.005, 'Problem - Severity'),
(14.006, 'Problem - Negative Flag'),
(14.007, 'Problem - Laterality'),
(15.001, 'Procedure - Procedure'),
(15.002, 'Procedure - Scheduled Date'),
(15.003, 'Procedure - Performed Date'),
(15.004, 'Procedure - Performed By'),
(15.005, 'Procedure - Laterality'),
(15.006, 'Procedure - Indication'),
(22.001, 'Resource - Resource'),
(22.002, 'Resource - Start Date'),
(22.003, 'Resource - End Date'),
(25.001, 'Risk - Risk'),
(25.002, 'Risk - Risk Factor'),
(25.003, 'Risk - Severity'),
(25.004, 'Risk - Start Date'),
(25.005, 'Risk - End Date'),
(25.006, 'Risk - Negative Flag'),
(24.001, 'Target - Subject'),
(24.002, 'Target - Target Value'),
(24.003, 'Target - Comparator'),
(24.004, 'Target - Start Date'),
(24.005, 'Target - End Date');

-- /sql/postsetup.sql

 --The adapter role needs the ability to create it's own schemas.
  GRANT CREATE ON DATABASE vault to adapter;

  --The adapter role needs the ability to truncate, insert, update, delete etc all data in the
  --universal schema.
  GRANT USAGE ON SCHEMA universal to adapter;

  --The adapter role needs the ability use sequences to generate keys.
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA universal TO adapter;

  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA universal TO adapter;

  --The adapter role needs to own the universal schema to truncate tables/sequences?
  ALTER SCHEMA universal OWNER TO adapter;

  --The adapter role needs the ability to lookup objects within the api schema.
  --GRANT USAGE ON SCHEMA api TO adapter;

  --The adapter role needs the ability to execute the logImport function within the api schema.
--  GRANT EXECUTE ON FUNCTION api.logImport() to adapter;
