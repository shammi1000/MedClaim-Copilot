namespace MedClaimCopilot.API.Models
{
    public class ComplianceResult
    {
        public double Score { get; set; }
        public string Status { get; set; } = "compliant"; // compliant | warning | violation
        public List<ComplianceIssue> Issues { get; set; } = new();
        public List<string> Recommendations { get; set; } = new();
        public bool IcdCodeValid { get; set; }
        public string? IcdCodeDescription { get; set; }
        public DateTime CheckedAt { get; set; } = DateTime.UtcNow;
    }

    public class ComplianceIssue
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Severity { get; set; } = "low"; // high | medium | low
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Regulation { get; set; } = string.Empty;
        public string Recommendation { get; set; } = string.Empty;
    }

    public class ComplianceCheckRequest
    {
        public string DiagnosisCode { get; set; } = string.Empty;
        public string? PolicyNumber { get; set; }
        public DateTime TreatmentDate { get; set; }
        public decimal ClaimAmount { get; set; }
        public string? HospitalName { get; set; }
        public int DocumentCount { get; set; }
    }
}
