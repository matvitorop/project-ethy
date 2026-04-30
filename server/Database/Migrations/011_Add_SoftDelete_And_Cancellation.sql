ALTER TABLE HelpRequests
ADD IsDeleted BIT NOT NULL DEFAULT 0,
    CancellationReason NVARCHAR(500) NULL;