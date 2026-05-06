ALTER TABLE Users
    ADD BlockedUntilUtc DATETIME2 NULL,
        BlockReason NVARCHAR(500) NULL,
        LastVolunteerApplicationAtUtc DATETIME2 NULL;

ALTER TABLE HelpRequests
    ADD IsHidden BIT NOT NULL DEFAULT 0;

ALTER TABLE UserComplaints ADD IsResolved BIT NOT NULL DEFAULT 0;