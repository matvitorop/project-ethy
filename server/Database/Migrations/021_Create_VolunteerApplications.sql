CREATE TABLE VolunteerApplications (
    Id                  UNIQUEIDENTIFIER    NOT NULL PRIMARY KEY DEFAULT NEWID(),
    UserId              UNIQUEIDENTIFIER    NOT NULL REFERENCES Users(Id),
    OrganizationName    NVARCHAR(200)       NOT NULL,
    ActivityDescription NVARCHAR(2000)      NOT NULL,
    DocumentImageUrl    NVARCHAR(500)       NULL,
    Status              INT                 NOT NULL DEFAULT 0, -- 0=Pending, 1=Approved, 2=Rejected
    AdminComment        NVARCHAR(500)       NULL,
    SubmittedAtUtc      DATETIME2           NOT NULL DEFAULT GETUTCDATE(),
    ReviewedAtUtc       DATETIME2           NULL,
    ReviewedByAdminId   UNIQUEIDENTIFIER    NULL REFERENCES Users(Id)
);

CREATE INDEX IX_VolunteerApplications_UserId ON VolunteerApplications(UserId);
CREATE INDEX IX_VolunteerApplications_Status ON VolunteerApplications(Status);