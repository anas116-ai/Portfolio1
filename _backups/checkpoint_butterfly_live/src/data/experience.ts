export interface ExperienceDomain {
  title: string;
  items: string[];
}

export interface Experience {
  title: string;
  company: string;
  client?: string;
  project: string;
  period: string;
  location: string;
  environment: string[];
  responsibilities: string[];
  domains: ExperienceDomain[];
}

export const experience: Experience = {
  title: "Software Engineer",
  company: "VHS Consulting India Pvt Ltd",
  client: "TCS",
  project: "Grainger",
  period: "March 2022 to February 2023",
  location: "Hyderabad, India",
  environment: [
    "SAP BODS 4.3",
    "SAP ECC",
    "SAP BW Process Chain Monitoring",
    "AWS S3 Bucket Loading",
    "SAP S/4HANA Loading",
    "IDoc & BAPI Interfaces",
    "Migration Tools: LTMOM, LSMW, LTMC",
    "SQL Server Validation",
    "ServiceNow",
  ],
  responsibilities: [
    "Designed, developed, and maintained ETL workflows using SAP BODS 4.3 for enterprise data processing.",
    "Extracted enterprise transaction and master data from SAP ECC via IDocs and BAPI interfaces.",
    "Engineered data loading pipelines targeting AWS S3 Buckets and SAP S/4HANA target systems.",
    "Monitored SAP BW Process Chains ensuring end-to-end batch execution without data anomalies.",
    "Applied migration tools knowledge including LTMOM, LSMW, and LTMC for structured data migration.",
    "Performed source-to-target reconciliation and SQL Server validation checks ensuring data consistency.",
    "Investigated and resolved production support tickets using ServiceNow with detailed root cause analysis.",
    "Prepared comprehensive Source-to-Target Mapping (STTM) documents and validation test cases.",
  ],
  domains: [
    {
      title: "ETL Development & AWS / S/4HANA Loading",
      items: [
        "Designed, developed, and maintained enterprise ETL workflows using SAP BODS 4.3 for high-volume data integration.",
        "Built SAP BODS Jobs, Workflows, Data Flows, and Data Stores for automated business processing.",
        "Loaded clean enterprise datasets into AWS S3 Buckets and supported SAP S/4HANA loading routines.",
        "Implemented Slowly Changing Dimensions (SCD Type 1 & Type 2) to maintain historical data consistency.",
      ],
    },
    {
      title: "Data Migration (LTMOM, LSMW, LTMC) & Interfaces",
      items: [
        "Extracted transaction and master data from SAP ECC using SAP tables, IDoc interfaces, and BAPI integrations.",
        "Applied data migration expertise across SAP LTMOM, LSMW, and LTMC migration cockpits.",
        "Integrated multi-source datasets from Excel, XML, SQL Server, and flat files into unified staging pipelines.",
      ],
    },
    {
      title: "SQL Validation & Data Integrity Assurance",
      items: [
        "Performed source-to-target reconciliation and SQL validation checks to guarantee complete data accuracy.",
        "Authored custom SQL scripts for duplicate detection, checksum validation, and schema consistency checks.",
        "Conducted thorough data quality analysis prior to production staging and release.",
      ],
    },
    {
      title: "SAP BW Process Chain Monitoring & Production Support",
      items: [
        "Monitored batch jobs via Data Services Management Console and SAP BW Process Chains.",
        "Supported daily production data load routines, resolving process chain interruptions and job failures.",
        "Investigated and resolved production support incidents via ServiceNow in collaboration with functional teams.",
      ],
    },
  ],
};

export const pipelineStages = [
  { label: "SAP ECC (IDoc/BAPI)", type: "source" as const },
  { label: "SAP BODS 4.3", type: "process" as const },
  { label: "SQL Validation", type: "check" as const },
  { label: "AWS S3 / S/4HANA", type: "target" as const },
  { label: "BW Process Chains", type: "process" as const },
  { label: "Production Delivery", type: "output" as const },
];
