namespace MedClaimCopilot.API.Models
{
    public class User
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Adjuster;
        public string? Department { get; set; }
        public string? Phone { get; set; }
        public DateTime JoinDate { get; set; }
        public NotificationPreferences Notifications { get; set; } = new();
        public bool IsActive { get; set; } = true;
    }

    public enum UserRole
    {
        Admin,
        Adjuster,
        Provider
    }

    public class NotificationPreferences
    {
        public bool EmailNotifications { get; set; } = true;
        public bool SmsNotifications { get; set; } = false;
        public bool ClaimUpdates { get; set; } = true;
        public bool SystemAlerts { get; set; } = true;
        public bool WeeklyReport { get; set; } = true;
    }
}
