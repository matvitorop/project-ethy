CREATE INDEX IX_HelpRequests_CreatorId
    ON HelpRequests(CreatorId);

CREATE INDEX IX_HelpRequestImages_RequestId
    ON HelpRequestImages(HelpRequestId);
