/** Static prototype fixtures. These are not live FortMind connections. */
export const integrationCategories = [
  "Threat intelligence",
  "Identity & email",
  "Endpoint & SIEM",
  "Cloud & logging",
  "Exposure & network",
] as const;

export type IntegrationCategory = (typeof integrationCategories)[number];
export type IntegrationAvailability = "attention" | "connected" | "available";

export interface PreviewIntegration {
  slug: string;
  name: string;
  mark: string;
  category: IntegrationCategory;
  availability: IntegrationAvailability;
  description: string;
  tools: readonly string[];
  enabledTools: number;
  casesUsed?: number;
  issue?: string;
  authMethod: string;
  scopes?: readonly string[];
  scopeNote?: string;
  rateLimit?: string;
  docsUrl: string;
}

export const previewIntegrations: readonly PreviewIntegration[] = [
  {
    slug: "microsoft-365", name: "Microsoft 365", mark: "M365", category: "Identity & email", availability: "attention",
    description: "Sign-in, audit, and email signals help OSCAR trace account activity across the tenant.",
    tools: ["sign_in_read", "audit_read", "message_trace"], enabledTools: 3, casesUsed: 24,
    issue: "No new events for 42 minutes. Verify event forwarding before relying on current coverage.",
    authMethod: "Microsoft Graph tenant authorization", scopeNote: "Confirm the minimum Graph permissions for the selected tools in your tenant before connecting.",
    docsUrl: "https://learn.microsoft.com/en-us/graph/overview",
  },
  {
    slug: "abuse-ch", name: "abuse.ch (unified)", mark: "ab", category: "Threat intelligence", availability: "connected",
    description: "MalwareBazaar, URLhaus, ThreatFox, YARAify, Feodo Tracker, and SSL Blacklist context in one source.",
    tools: ["malware_lookup", "urlhaus_query", "threatfox_lookup", "yara_lookup", "feodo_lookup", "ssl_blacklist_lookup"], enabledTools: 6, casesUsed: 17,
    authMethod: "Auth key", scopeNote: "No OAuth scopes. Access depends on the abuse.ch API and key entitlement.",
    docsUrl: "https://urlhaus.abuse.ch/api/",
  },
  {
    slug: "virustotal", name: "VirusTotal", mark: "VT", category: "Threat intelligence", availability: "connected",
    description: "Reputation and scan context for IPs, domains, file hashes, and URLs.",
    tools: ["vt_v3_read", "ip_lookup"], enabledTools: 2, casesUsed: 56,
    authMethod: "API key", scopeNote: "No OAuth scopes. Endpoint access depends on the licensed API tier.",
    rateLimit: "Depends on the licensed API tier and contract.", docsUrl: "https://docs.virustotal.com/reference/overview",
  },
  {
    slug: "microsoft-entra-id", name: "Microsoft Entra ID", mark: "Entra", category: "Identity & email", availability: "connected",
    description: "Sign-in and directory audit lookups surface account anomalies and identity changes.",
    tools: ["sign_in_read", "directory_audit_read"], enabledTools: 2, casesUsed: 18,
    authMethod: "Microsoft Graph tenant authorization", scopes: ["AuditLog.Read.All", "Directory.Read.All"],
    docsUrl: "https://learn.microsoft.com/en-us/graph/api/resources/azure-ad-auditlog-overview",
  },
  {
    slug: "microsoft-defender", name: "Microsoft Defender", mark: "MD", category: "Endpoint & SIEM", availability: "connected",
    description: "Endpoint incidents and host evidence add process and detection context to investigations.",
    tools: ["Incident.Read.All"], enabledTools: 1, casesUsed: 4,
    authMethod: "Microsoft Graph tenant authorization", scopes: ["Incident.Read.All"],
    docsUrl: "https://learn.microsoft.com/en-us/graph/api/resources/security-api-overview",
  },
  {
    slug: "aws-cloudtrail", name: "AWS CloudTrail", mark: "aws", category: "Cloud & logging", availability: "connected",
    description: "CloudTrail event lookups by user or hostname help trace cloud activity.",
    tools: ["cloudtrail_lookup_events"], enabledTools: 1, casesUsed: 33,
    authMethod: "AWS account credentials or role", scopeNote: "IAM permissions depend on the deployment and enabled CloudTrail queries.",
    docsUrl: "https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html",
  },
  {
    slug: "greynoise", name: "GreyNoise (community)", mark: "GN", category: "Threat intelligence", availability: "connected",
    description: "Separates routine internet scanners from IPs that merit closer investigation.",
    tools: ["community_lookup"], enabledTools: 1, casesUsed: 11,
    authMethod: "Community API access", scopeNote: "No OAuth scopes. Access and limits depend on the account tier.",
    rateLimit: "Community/free accounts: 50 searches per week across the API and Visualizer.",
    docsUrl: "https://docs.greynoise.io/docs/using-the-greynoise-community-api",
  },
  {
    slug: "alienvault-otx", name: "AlienVault OTX", mark: "OTX", category: "Threat intelligence", availability: "connected",
    description: "Open threat exchange pulse and reputation lookups for investigation indicators.",
    tools: ["indicator_read", "pulse_read"], enabledTools: 2, casesUsed: 36,
    authMethod: "API key", scopeNote: "No OAuth scopes are represented in this preview.",
    docsUrl: "https://otx.alienvault.com/api",
  },
  {
    slug: "urlscan", name: "urlscan.io", mark: "url", category: "Threat intelligence", availability: "connected",
    description: "Sandbox-style URL and page analysis for web and network evidence.",
    tools: ["scan_submit", "result_read"], enabledTools: 2, casesUsed: 11,
    authMethod: "API key", scopeNote: "No OAuth scopes are represented in this preview.",
    docsUrl: "https://urlscan.io/docs/api/",
  },
  {
    slug: "wazuh", name: "Wazuh", mark: "W", category: "Endpoint & SIEM", availability: "connected",
    description: "Host alerts and recent endpoint events provide investigation context.",
    tools: ["search"], enabledTools: 1, casesUsed: 18,
    authMethod: "Wazuh API credentials", scopeNote: "Provider roles and permissions depend on the Wazuh deployment.",
    docsUrl: "https://documentation.wazuh.com/current/",
  },
  {
    slug: "shodan", name: "Shodan", mark: "S", category: "Exposure & network", availability: "available",
    description: "Open ports, banners, and known vulnerabilities for public IP addresses.",
    tools: ["host_read"], enabledTools: 0, authMethod: "API key", scopeNote: "No OAuth scopes.",
    docsUrl: "https://developer.shodan.io/api",
  },
  {
    slug: "crowdstrike-falcon", name: "CrowdStrike Falcon", mark: "CS", category: "Endpoint & SIEM", availability: "available",
    description: "Device context and endpoint detections by host or IP.",
    tools: ["hosts_read", "detections_read"], enabledTools: 0, authMethod: "Falcon API client credentials",
    scopeNote: "Select only the API permissions required by the enabled tools.", docsUrl: "https://developer.crowdstrike.com/",
  },
  {
    slug: "splunk", name: "Splunk", mark: "S>", category: "Endpoint & SIEM", availability: "available",
    description: "Search indexed events and correlate IPs, users, and hosts.",
    tools: ["search", "rest_api_read"], enabledTools: 0, authMethod: "Splunk API token or service account",
    scopeNote: "Search permissions depend on the indexes selected in Splunk.", docsUrl: "https://dev.splunk.com/enterprise/docs/devtools/restapi/",
  },
  {
    slug: "okta", name: "Okta", mark: "Okta", category: "Identity & email", availability: "available",
    description: "Users, sessions, and recent sign-ins for identity investigations.",
    tools: ["okta.users.read", "okta.logs.read"], enabledTools: 0, authMethod: "Okta API token or OAuth client",
    scopes: ["okta.users.read", "okta.logs.read"], docsUrl: "https://developer.okta.com/docs/reference/",
  },
  {
    slug: "datadog", name: "Datadog", mark: "DD", category: "Cloud & logging", availability: "available",
    description: "Search recent log events by IP, user, host, or domain.",
    tools: ["logs_read"], enabledTools: 0, authMethod: "Datadog API and application keys",
    scopeNote: "Permissions depend on the Datadog organization and application key.", docsUrl: "https://docs.datadoghq.com/api/latest/",
  },
  {
    slug: "microsoft-sentinel", name: "Microsoft Sentinel", mark: "MS", category: "Endpoint & SIEM", availability: "available",
    description: "Query security incidents and Log Analytics events in an Azure workspace.",
    tools: ["sentinel_incidents_read", "log_analytics_data"], enabledTools: 0, authMethod: "Azure application authorization",
    scopeNote: "Workspace and Azure permissions must be confirmed for the chosen query path.", docsUrl: "https://learn.microsoft.com/en-us/azure/sentinel/",
  },
  {
    slug: "censys", name: "Censys", mark: "C", category: "Exposure & network", availability: "available",
    description: "Host and service visibility, including open ports, certificates, and ASN context.",
    tools: ["platform_read", "host_read"], enabledTools: 0, authMethod: "Censys API credentials",
    scopeNote: "No OAuth scopes are represented in this preview.", docsUrl: "https://docs.censys.com/",
  },
  {
    slug: "elastic-security", name: "Elastic Security", mark: "E", category: "Endpoint & SIEM", availability: "available",
    description: "Search alerts and investigation data already indexed in Elastic.",
    tools: ["search_read"], enabledTools: 0, authMethod: "Elastic API key",
    scopeNote: "Index privileges depend on the Elastic deployment.", docsUrl: "https://www.elastic.co/guide/en/security/current/index.html",
  },
  {
    slug: "cloudflare-zero-trust", name: "Cloudflare Zero Trust", mark: "CF", category: "Exposure & network", availability: "available",
    description: "Access and network event lookups for user and device investigations.",
    tools: ["zerotrust_read"], enabledTools: 0, authMethod: "Cloudflare API token",
    scopeNote: "Choose the read permissions required for the selected account and logs.", docsUrl: "https://developers.cloudflare.com/cloudflare-one/",
  },
  {
    slug: "securitytrails", name: "SecurityTrails", mark: "ST", category: "Threat intelligence", availability: "available",
    description: "DNS and WHOIS history for domains and IP addresses.",
    tools: ["domain_read", "ip_read"], enabledTools: 0, authMethod: "API key",
    scopeNote: "No OAuth scopes are represented in this preview.", docsUrl: "https://docs.securitytrails.com/",
  },
];

export const previewIntegrationBySlug = (slug: string) =>
  previewIntegrations.find((integration) => integration.slug === slug);

export const attentionIntegrations = previewIntegrations.filter(
  (integration) => integration.availability === "attention",
);
