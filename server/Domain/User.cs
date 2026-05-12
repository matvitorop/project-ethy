using server.Domain.Exceptions;

namespace server.Domain
{
    public enum UserRole
    {
        Admin = 0,
        User = 1,
        Volunteer = 2
    }
    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string PasswordSalt { get; set; }
        public UserRole Role { get; private set; }
        public DateTime RegisteredAtUtc { get; private set; }
        public bool HasActiveRequestLimit { get; private set; }
        public bool IsDeleted { get; private set; }
        public DateTime? DeletedAtUtc { get; private set; }
        public Guid? DeletedById { get; private set; }

        // Trust module
        public string? PhoneNumber { get; private set; }
        public string? SocialLinks { get; private set; }
        public bool IsEmailVerified { get; private set; }
        // ---

        // Ad/Vol module
        public DateTime? BlockedUntilUtc { get; private set; }
        public string? BlockReason { get; private set; }
        public DateTime? LastVolunteerApplicationAtUtc { get; private set; }

        public bool IsBlocked =>
            BlockedUntilUtc.HasValue &&
            (BlockedUntilUtc.Value > DateTime.UtcNow || BlockedUntilUtc == DateTime.MaxValue);
        // ---


        private User() { }

        public User(string userName, string email, string passwordHash, string passwordSalt, UserRole role)
        {
            Id = Guid.NewGuid();
            Username = userName;
            Email = email;
            PasswordHash = passwordHash;
            PasswordSalt = passwordSalt;
            Role = role;
            RegisteredAtUtc = DateTime.UtcNow;
            HasActiveRequestLimit = true;
        }
        public void RemoveActiveRequestLimit()
        {
            HasActiveRequestLimit = false;
        }
        public void UpdateUsername(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                throw new DomainException(
                    "Username is required", 
                    "User.USERNAME_REQUIRED");

            if (username.Length > 50)
                throw new DomainException(
                    "Username is too long", 
                    "User.USERNAME_TOO_LONG");

            Username = username;
        }
        public void UpdatePassword(string passwordHash, string passwordSalt)
        {
            if (string.IsNullOrWhiteSpace(passwordHash))
                throw new DomainException(
                    "Password hash is required", 
                    "User.PASSWORD_HASH_REQUIRED");

            PasswordHash = passwordHash;
            PasswordSalt = passwordSalt;
        }

        // Trust module
        public void UpdateProfile(string? phoneNumber, string? socialLinks)
        {
            if (phoneNumber is not null && phoneNumber.Length > 20)
                throw new DomainException(
                    "Phone number is too long", 
                    "User.PHONE_TOO_LONG");

            if (socialLinks is not null)
            {
                if (socialLinks.Length > 500)
                    throw new DomainException(
                        "Social links value is too long", 
                        "User.SOCIAL_LINKS_TOO_LONG");

                // Basic sanitization/blacklist
                var forbidden = new[] { "<script", "javascript:", "onerror", "onclick", "onload", "href=", "src=" };
                foreach (var f in forbidden)
                {
                    if (socialLinks.Contains(f, StringComparison.OrdinalIgnoreCase))
                        throw new DomainException("Invalid social link format", "User.SOCIAL_LINKS_FORBIDDEN");
                }

                // Auto-fix @username (if it's a single word starting with @)
                var trimmed = socialLinks.Trim();
                if (trimmed.StartsWith("@") && !trimmed.Contains(" "))
                {
                    socialLinks = $"https://t.me/{trimmed.Substring(1)}";
                }
            }

            PhoneNumber = phoneNumber;
            SocialLinks = socialLinks;
        }

        public void VerifyEmail()
        {
            IsEmailVerified = true;
        }
        // ---

        public void SoftDelete(Guid deletedById)
        {
            if (IsDeleted)
                throw new DomainException(
                    "User is already deleted", 
                    "User.ALREADY_DELETED");

            IsDeleted = true;
            DeletedAtUtc = DateTime.UtcNow;
            DeletedById = deletedById;
        }

        // Ad/Vol module
        public void Block(DateTime? blockedUntilUtc, string reason)
        {
            if (string.IsNullOrWhiteSpace(reason))
                throw new DomainException("Block reason is required", "User.BLOCK_REASON_REQUIRED");

            BlockedUntilUtc = blockedUntilUtc ?? DateTime.MaxValue; // null = permanent
            BlockReason = reason;
        }

        public void Unblock()
        {
            BlockedUntilUtc = null;
            BlockReason = null;
        }

        public void PromoteToVolunteer()
        {
            if (Role == UserRole.Admin)
                throw new DomainException("Cannot change admin role", "User.CANNOT_CHANGE_ADMIN_ROLE");

            Role = UserRole.Volunteer;
        }

        public void DemoteToUser()
        {
            if (Role == UserRole.Admin)
                throw new DomainException("Cannot change admin role", "User.CANNOT_CHANGE_ADMIN_ROLE");

            Role = UserRole.User;
        }

        public void SetLastVolunteerApplicationDate()
        {
            LastVolunteerApplicationAtUtc = DateTime.UtcNow;
        }
        // ---

    }
}
