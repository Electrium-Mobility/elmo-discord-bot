import csv
import os
import sys
import base64
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import codecs


SCOPES = [
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.send",
]
creds = None
if os.path.exists("./helperFunctions/email/token.json"):
    creds = Credentials.from_authorized_user_file(
        "./helperFunctions/email/token.json", SCOPES
    )

if not creds or not creds.valid:
    # print(creds)
    # print(creds.expired)
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
        creds = flow.run_local_server(port=0)

    with open("./helperFunctions/email/token.json", "w") as token:
        token.write(creds.to_json())


# Step 4: Read the CSV file into your program
with codecs.open("./helperFunctions/email/emailList.csv", encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)

    columns = reader.fieldnames

    other_values = []
    # Step 5: Iterate over each row in the CSV file
    for row in reader:
        email = row["Email"]

        # Step 6: Use the Gmail API to send an acceptance or rejection email
        with open("./helperFunctions/email/email_templates/message.txt", "r") as f:
            template = f.read()

        message = template
        for column in columns:
            value = row[column]
            variable = f"[{column}]"
            message = message.replace(variable, f"{value}")
        subject = "Acceptance Email"

        service = build("gmail", "v1", credentials=creds)
        # fixes wrapping issue
        message = message.replace("\n", "<br>")

        # Retrieve the email signature from Gmail settings
        sendas = (
            service.users()
            .settings()
            .sendAs()
            .get(userId="me", sendAsEmail="electriummobility@gmail.com")
            .execute()
        )
        signature = sendas["signature"]

        message += "<br>" + signature

        create_message = f"From: electriummobility@gmail.com\nTo: {email}\nSubject: {subject}\nContent-Type: text/html; charset=utf-8\n\n{message}"

        try:
            message = {
                "raw": base64.urlsafe_b64encode(create_message.encode()).decode()
            }
            send_message = (
                service.users().messages().send(userId="me", body=message).execute()
            )

            print(
                f'The message was sent to {email} successfully Message Id: {send_message["id"]}'
            )
            sys.stdout.flush()
        except HttpError as error:
            print(f"An error occurred: {error}")
            sys.stdout.flush()
