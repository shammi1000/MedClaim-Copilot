namespace MedClaimCopilot.API.Models
{
    public class Claim
    {
        public string Id { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public DateTime PatientDob { get; set; }
        public string InsuranceId { get; set; } = string.Empty;
        public string PolicyNumber { get; set; } = string.Empty;
        public string DiagnosisCode { get; set; } = string.Empty;
        public string DiagnosisDescription { get; set; } = string.Empty;
        public DateTime TreatmentDate { get; set; }
        public string HospitalName { get; set; } = string.Empty;
        public decimal ClaimAmount { get; set; }
        public ClaimStatus Status { get; set; } = ClaimStatus.Pending;
        public DateTime SubmittedDate { get; set; } = DateTime.UtcNow;
        public string? AdjusterNotes { get; set; }
        public string? ProviderId { get; set; }
        public List<ClaimDocument> Documents { get; set; } = new();
        public List<TimelineEvent> Timeline { get; set; } = new();
    }

    public enum ClaimStatus
    {
        Pending,
        InReview,
        Approved,
        Rejected
    }

    public class ClaimDocument
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }

    public class TimelineEvent
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Event { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = "completed";
        public string? Actor { get; set; }
    }
}
