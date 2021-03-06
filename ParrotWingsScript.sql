USE [ParrotWings]
GO
/****** Object:  Table [dbo].[Transaction]    Script Date: 22.02.2019 15:34:09 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Transaction](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[idRecipient] [int] NOT NULL,
	[idAddresser] [int] NOT NULL,
	[timestamp] [datetime] NOT NULL CONSTRAINT [DF_Transaction_timestamp]  DEFAULT (getdate()),
	[amountPW] [int] NOT NULL,
	[resultingAddresserBalance] [int] NOT NULL,
	[resultingRecipientBalance] [int] NOT NULL,
 CONSTRAINT [PK_Transaction] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[User]    Script Date: 22.02.2019 15:34:10 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[User](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [varchar](250) NOT NULL,
	[email] [varchar](250) NOT NULL,
	[password] [varchar](250) NOT NULL,
	[balance] [int] NOT NULL CONSTRAINT [DF_User_balance]  DEFAULT ((500)),
 CONSTRAINT [PK_User] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
ALTER TABLE [dbo].[Transaction]  WITH CHECK ADD  CONSTRAINT [FK_Transaction_UserAddresser] FOREIGN KEY([idAddresser])
REFERENCES [dbo].[User] ([id])
GO
ALTER TABLE [dbo].[Transaction] CHECK CONSTRAINT [FK_Transaction_UserAddresser]
GO
ALTER TABLE [dbo].[Transaction]  WITH CHECK ADD  CONSTRAINT [FK_Transaction_UserRecipient] FOREIGN KEY([idRecipient])
REFERENCES [dbo].[User] ([id])
GO
ALTER TABLE [dbo].[Transaction] CHECK CONSTRAINT [FK_Transaction_UserRecipient]
GO
