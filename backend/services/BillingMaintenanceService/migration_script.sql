IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260615103357_InitialCreate'
)
BEGIN
    CREATE TABLE [Bills] (
        [Id] uniqueidentifier NOT NULL,
        [RoomId] int NOT NULL,
        [TargetMonth] nvarchar(max) NOT NULL,
        [ElectricityCost] decimal(18,2) NOT NULL,
        [WaterCost] decimal(18,2) NOT NULL,
        [TotalAmount] decimal(18,2) NOT NULL,
        [IsPaid] bit NOT NULL,
        CONSTRAINT [PK_Bills] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260615103357_InitialCreate'
)
BEGIN
    CREATE TABLE [MaintenanceRequests] (
        [Id] uniqueidentifier NOT NULL,
        [RoomId] int NOT NULL,
        [Description] nvarchar(max) NOT NULL,
        [Status] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_MaintenanceRequests] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260615103357_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260615103357_InitialCreate', N'9.0.16');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260618045523_SeedInitialData'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ElectricityCost', N'IsPaid', N'RoomId', N'TargetMonth', N'TotalAmount', N'WaterCost') AND [object_id] = OBJECT_ID(N'[Bills]'))
        SET IDENTITY_INSERT [Bills] ON;
    EXEC(N'INSERT INTO [Bills] ([Id], [ElectricityCost], [IsPaid], [RoomId], [TargetMonth], [TotalAmount], [WaterCost])
    VALUES (''11111111-1111-1111-1111-111111111111'', 450000.0, CAST(1 AS bit), 0, N'''', 570000.0, 120000.0),
    (''22222222-2222-2222-2222-222222222222'', 500000.0, CAST(0 AS bit), 0, N'''', 650000.0, 150000.0)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ElectricityCost', N'IsPaid', N'RoomId', N'TargetMonth', N'TotalAmount', N'WaterCost') AND [object_id] = OBJECT_ID(N'[Bills]'))
        SET IDENTITY_INSERT [Bills] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260618045523_SeedInitialData'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description', N'RoomId', N'Status') AND [object_id] = OBJECT_ID(N'[MaintenanceRequests]'))
        SET IDENTITY_INSERT [MaintenanceRequests] ON;
    EXEC(N'INSERT INTO [MaintenanceRequests] ([Id], [CreatedAt], [Description], [RoomId], [Status])
    VALUES (''33333333-3333-3333-3333-333333333333'', ''2026-06-13T11:55:22.7275215+07:00'', N''Hỏng điều hòa'', 101, N''Completed''),
    (''44444444-4444-4444-4444-444444444444'', ''2026-06-18T11:55:22.7289450+07:00'', N''Rò rỉ nước'', 205, N''Pending'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description', N'RoomId', N'Status') AND [object_id] = OBJECT_ID(N'[MaintenanceRequests]'))
        SET IDENTITY_INSERT [MaintenanceRequests] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260618045523_SeedInitialData'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260618045523_SeedInitialData', N'9.0.16');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260618045855_FixSeedDataTime'
)
BEGIN
    EXEC(N'UPDATE [MaintenanceRequests] SET [CreatedAt] = ''2026-06-10T00:00:00.0000000''
    WHERE [Id] = ''33333333-3333-3333-3333-333333333333'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260618045855_FixSeedDataTime'
)
BEGIN
    EXEC(N'UPDATE [MaintenanceRequests] SET [CreatedAt] = ''2026-06-15T00:00:00.0000000''
    WHERE [Id] = ''44444444-4444-4444-4444-444444444444'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260618045855_FixSeedDataTime'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260618045855_FixSeedDataTime', N'9.0.16');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260619044325_ExpandModels_And_FixSeedData'
)
BEGIN
    ALTER TABLE [MaintenanceRequests] ADD [Category] nvarchar(max) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260619044325_ExpandModels_And_FixSeedData'
)
BEGIN
    ALTER TABLE [MaintenanceRequests] ADD [Priority] nvarchar(max) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260619044325_ExpandModels_And_FixSeedData'
)
BEGIN
    ALTER TABLE [MaintenanceRequests] ADD [Title] nvarchar(max) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260619044325_ExpandModels_And_FixSeedData'
)
BEGIN
    ALTER TABLE [MaintenanceRequests] ADD [UpdatedAt] datetime2 NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260619044325_ExpandModels_And_FixSeedData'
)
BEGIN
    ALTER TABLE [Bills] ADD [ContractId] nvarchar(max) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260619044325_ExpandModels_And_FixSeedData'
)
BEGIN
    ALTER TABLE [Bills] ADD [CreatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260619044325_ExpandModels_And_FixSeedData'
)
BEGIN
    ALTER TABLE [Bills] ADD [PaidAt] datetime2 NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260619044325_ExpandModels_And_FixSeedData'
)
BEGIN
    ALTER TABLE [Bills] ADD [ServiceFee] decimal(18,2) NOT NULL DEFAULT 0.0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260619044325_ExpandModels_And_FixSeedData'
)
BEGIN
    ALTER TABLE [Bills] ADD [StudentId] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260619044325_ExpandModels_And_FixSeedData'
)
BEGIN
    ALTER TABLE [Bills] ADD [Title] nvarchar(max) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260619044325_ExpandModels_And_FixSeedData'
)
BEGIN
    EXEC(N'UPDATE [Bills] SET [ContractId] = N''CTR-001'', [CreatedAt] = ''2026-06-01T00:00:00.0000000'', [PaidAt] = ''2026-06-05T00:00:00.0000000'', [RoomId] = 101, [ServiceFee] = 50000.0, [StudentId] = 1001, [TargetMonth] = N''06/2026'', [Title] = N''Hóa đơn tháng 06/2026 - Phòng 101'', [TotalAmount] = 620000.0
    WHERE [Id] = ''11111111-1111-1111-1111-111111111111'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260619044325_ExpandModels_And_FixSeedData'
)
BEGIN
    EXEC(N'UPDATE [Bills] SET [ContractId] = N''CTR-002'', [CreatedAt] = ''2026-06-01T00:00:00.0000000'', [PaidAt] = NULL, [RoomId] = 205, [ServiceFee] = 50000.0, [StudentId] = 1002, [TargetMonth] = N''06/2026'', [Title] = N''Hóa đơn tháng 06/2026 - Phòng 205'', [TotalAmount] = 700000.0
    WHERE [Id] = ''22222222-2222-2222-2222-222222222222'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260619044325_ExpandModels_And_FixSeedData'
)
BEGIN
    EXEC(N'UPDATE [MaintenanceRequests] SET [Category] = N''Điện'', [Description] = N''Điều hòa không lạnh, phát ra tiếng ồn lớn, chảy nước'', [Priority] = N''Normal'', [Title] = N''Hỏng điều hòa'', [UpdatedAt] = ''2026-06-12T00:00:00.0000000''
    WHERE [Id] = ''33333333-3333-3333-3333-333333333333'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260619044325_ExpandModels_And_FixSeedData'
)
BEGIN
    EXEC(N'UPDATE [MaintenanceRequests] SET [Category] = N''Nước'', [CreatedAt] = ''2026-06-18T00:00:00.0000000'', [Description] = N''Ống nước dưới bồn rửa mặt bị nứt, nước chảy ra sàn nhà vệ sinh'', [Priority] = N''Critical'', [Title] = N''Rò rỉ đường ống nước'', [UpdatedAt] = NULL
    WHERE [Id] = ''44444444-4444-4444-4444-444444444444'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260619044325_ExpandModels_And_FixSeedData'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260619044325_ExpandModels_And_FixSeedData', N'9.0.16');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260619045450_AddUserAuthAndSeed'
)
BEGIN
    CREATE TABLE [Users] (
        [Id] uniqueidentifier NOT NULL,
        [Username] nvarchar(max) NOT NULL,
        [PasswordHash] nvarchar(max) NOT NULL,
        [Role] nvarchar(max) NOT NULL,
        [ReferenceId] int NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260619045450_AddUserAuthAndSeed'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'PasswordHash', N'ReferenceId', N'Role', N'Username') AND [object_id] = OBJECT_ID(N'[Users]'))
        SET IDENTITY_INSERT [Users] ON;
    EXEC(N'INSERT INTO [Users] ([Id], [PasswordHash], [ReferenceId], [Role], [Username])
    VALUES (''55555555-5555-5555-5555-555555555555'', N''$2a$11$K.eA15gXoD825z6Yg6A8U.H4iF4V4WwJ1F95O9v.r3p101m4e3j8O'', NULL, N''Admin'', N''admin''),
    (''66666666-6666-6666-6666-666666666666'', N''$2a$11$K.eA15gXoD825z6Yg6A8U.H4iF4V4WwJ1F95O9v.r3p101m4e3j8O'', NULL, N''Staff'', N''staff''),
    (''77777777-7777-7777-7777-777777777777'', N''$2a$11$K.eA15gXoD825z6Yg6A8U.H4iF4V4WwJ1F95O9v.r3p101m4e3j8O'', 1001, N''Student'', N''student1001'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'PasswordHash', N'ReferenceId', N'Role', N'Username') AND [object_id] = OBJECT_ID(N'[Users]'))
        SET IDENTITY_INSERT [Users] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260619045450_AddUserAuthAndSeed'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260619045450_AddUserAuthAndSeed', N'9.0.16');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625063529_AddMissingFields_BillAndMaintenance'
)
BEGIN
    ALTER TABLE [MaintenanceRequests] ADD [ImageUrl] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625063529_AddMissingFields_BillAndMaintenance'
)
BEGIN
    ALTER TABLE [MaintenanceRequests] ADD [StudentId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625063529_AddMissingFields_BillAndMaintenance'
)
BEGIN
    ALTER TABLE [Bills] ADD [BillType] nvarchar(20) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625063529_AddMissingFields_BillAndMaintenance'
)
BEGIN
    ALTER TABLE [Bills] ADD [DueDate] datetime2 NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625063529_AddMissingFields_BillAndMaintenance'
)
BEGIN
    ALTER TABLE [Bills] ADD [ExtraAmount] decimal(18,2) NOT NULL DEFAULT 0.0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625063529_AddMissingFields_BillAndMaintenance'
)
BEGIN
    ALTER TABLE [Bills] ADD [FeeReason] nvarchar(200) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625063529_AddMissingFields_BillAndMaintenance'
)
BEGIN
    ALTER TABLE [Bills] ADD [ReceiptCode] nvarchar(50) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625063529_AddMissingFields_BillAndMaintenance'
)
BEGIN
    EXEC(N'UPDATE [Bills] SET [BillType] = N''MONTHLY'', [DueDate] = ''2026-06-15T00:00:00.0000000'', [ExtraAmount] = 0.0, [FeeReason] = NULL, [ReceiptCode] = N''BR-20260605-11111111''
    WHERE [Id] = ''11111111-1111-1111-1111-111111111111'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625063529_AddMissingFields_BillAndMaintenance'
)
BEGIN
    EXEC(N'UPDATE [Bills] SET [BillType] = N''MONTHLY'', [DueDate] = ''2026-06-28T00:00:00.0000000'', [ExtraAmount] = 0.0, [FeeReason] = NULL, [ReceiptCode] = NULL
    WHERE [Id] = ''22222222-2222-2222-2222-222222222222'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625063529_AddMissingFields_BillAndMaintenance'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'BillType', N'ContractId', N'CreatedAt', N'DueDate', N'ElectricityCost', N'ExtraAmount', N'FeeReason', N'IsPaid', N'PaidAt', N'ReceiptCode', N'RoomId', N'ServiceFee', N'StudentId', N'TargetMonth', N'Title', N'TotalAmount', N'WaterCost') AND [object_id] = OBJECT_ID(N'[Bills]'))
        SET IDENTITY_INSERT [Bills] ON;
    EXEC(N'INSERT INTO [Bills] ([Id], [BillType], [ContractId], [CreatedAt], [DueDate], [ElectricityCost], [ExtraAmount], [FeeReason], [IsPaid], [PaidAt], [ReceiptCode], [RoomId], [ServiceFee], [StudentId], [TargetMonth], [Title], [TotalAmount], [WaterCost])
    VALUES (''88888888-8888-8888-8888-888888888888'', N''EXTRA_FEE'', N''CTR-001'', ''2026-06-20T00:00:00.0000000'', ''2026-06-30T00:00:00.0000000'', 0.0, 200000.0, N''Phạt vi phạm'', CAST(0 AS bit), NULL, NULL, 101, 0.0, 1001, N''Lẻ phát sinh'', N''Phí phát sinh - Phạt vi phạm'', 200000.0, 0.0)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'BillType', N'ContractId', N'CreatedAt', N'DueDate', N'ElectricityCost', N'ExtraAmount', N'FeeReason', N'IsPaid', N'PaidAt', N'ReceiptCode', N'RoomId', N'ServiceFee', N'StudentId', N'TargetMonth', N'Title', N'TotalAmount', N'WaterCost') AND [object_id] = OBJECT_ID(N'[Bills]'))
        SET IDENTITY_INSERT [Bills] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625063529_AddMissingFields_BillAndMaintenance'
)
BEGIN
    EXEC(N'UPDATE [MaintenanceRequests] SET [ImageUrl] = NULL, [StudentId] = 1001
    WHERE [Id] = ''33333333-3333-3333-3333-333333333333'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625063529_AddMissingFields_BillAndMaintenance'
)
BEGIN
    EXEC(N'UPDATE [MaintenanceRequests] SET [ImageUrl] = NULL, [StudentId] = 1002
    WHERE [Id] = ''44444444-4444-4444-4444-444444444444'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625063529_AddMissingFields_BillAndMaintenance'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Category', N'CreatedAt', N'Description', N'ImageUrl', N'Priority', N'RoomId', N'Status', N'StudentId', N'Title', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[MaintenanceRequests]'))
        SET IDENTITY_INSERT [MaintenanceRequests] ON;
    EXEC(N'INSERT INTO [MaintenanceRequests] ([Id], [Category], [CreatedAt], [Description], [ImageUrl], [Priority], [RoomId], [Status], [StudentId], [Title], [UpdatedAt])
    VALUES (''99999999-9999-9999-9999-999999999999'', N''Điện'', ''2026-06-22T00:00:00.0000000'', N''Bóng đèn phòng ngủ bị hỏng, phòng tối, ảnh hưởng việc học'', NULL, N''Normal'', 101, N''Processing'', 1001, N''Bóng đèn phòng bị hỏng'', ''2026-06-23T00:00:00.0000000'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Category', N'CreatedAt', N'Description', N'ImageUrl', N'Priority', N'RoomId', N'Status', N'StudentId', N'Title', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[MaintenanceRequests]'))
        SET IDENTITY_INSERT [MaintenanceRequests] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260625063529_AddMissingFields_BillAndMaintenance'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260625063529_AddMissingFields_BillAndMaintenance', N'9.0.16');
END;

COMMIT;
GO

