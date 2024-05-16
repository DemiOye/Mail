document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  document.getElementById("submit-btn").onclick = function(e) {
    e.preventDefault();
    let sender = document.getElementById("compose-sender").value;
    let recipients = document.getElementById("compose-recipients").value;
    let subject = document.getElementById("compose-subject").value;
    let body = document.getElementById("compose-body").value;
    const email = {'sender':sender, 'recipients':recipients, 'subject':subject, 'body':body};
    sendEmail(email);

  }
  
  function sendEmail(email) {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify(email),
    })
    //.then(response => response.json())
    //.then(data => {
      //console.log(data);
      //load_mailbox('sent');
    //});
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        document.getElementById("error").innerHTML = "Error: " + data.error;
      }
      else {
        console.log(data);
        load_mailbox('sent');
      }
    })
  }
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#email-title').style.display = 'none';
  document.querySelector('#emails-cont').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.getElementById("email").style.display = "none";
  document.getElementById("new-email-title").style.display = "block";
  document.getElementById("reply-email-title").style.display = "none";

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  document.getElementById("compose-recipients").disabled = false;
  document.getElementById("compose-subject").disabled = false;
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#email-title').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-cont').style.display = 'block';
  document.getElementById("email").style.display = "none";
  document.querySelectorAll('.email-div-read').forEach(function(a){ a.remove(); });
  document.querySelectorAll('.email-div-unread').forEach(function(a){ a.remove(); });
  document.querySelectorAll('.message').forEach(function(a){ a.remove(); });
  document.getElementById("error").innerHTML = "";

  // Show the mailbox name
  document.querySelector('#email-title').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  if (mailbox == "inbox") {

    // Load Inbox 
    fetch('/emails/inbox')
    .then(response => response.json())
    .then(emails => {
      // Print emails
      console.log(emails);
      // ... do something else with emails ...
      //console.log(emails[0])
      if (emails == "") {
        const message = document.createElement('span');
        message.classList.add('message');
        message.innerHTML = "Your inbox is empty";
        document.getElementById("emails-cont").append(message);
      } else {
        emails.forEach(function(email) {
          const inboxEmail = document.createElement('div');
          if (email.read == true) {
            inboxEmail.classList.add('email-div-read');
          } else {
            inboxEmail.classList.add('email-div-unread');
          }
          document.getElementById("emails-cont").append(inboxEmail);
          const inboxEmailSender = document.createElement('b');
          inboxEmailSender.innerHTML = email.sender;
          inboxEmailSender.classList.add('sender');
          inboxEmail.append(inboxEmailSender);
          const inboxEmailSubject = document.createElement('span');
          inboxEmailSubject.innerHTML = email.subject;
          inboxEmail.append(inboxEmailSubject);
          const viewBtn = document.createElement('button');
          viewBtn.classList.add('view-email');
          viewBtn.innerHTML = "View";
          viewBtn.onclick =()=> {
            fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                read: true
              })
            })
            .then(response => response.json())
            .then(data => {
              console.log(data.read);
            });
            //console.log(email.read)
            console.log(email);
            document.getElementById("email-title").style.display = "none";
            document.getElementById("emails-cont").style.display = "none";
            document.getElementById("email").style.display = "block";
            document.getElementById("from").innerHTML = email.sender;
            document.getElementById("to").innerHTML = email.recipients;
            document.getElementById("subject").innerHTML = email.subject;
            document.getElementById("time").innerHTML = email.timestamp;
            document.getElementById("body").innerHTML = email.body;
            document.getElementById("reply").style.display = "block";
            document.getElementById("archive-btn").style.display = "block";
            document.getElementById("unarchive-btn").style.display = "none";
            document.getElementById("reply").onclick =()=> {
              document.getElementById("email").style.display = "none";
              document.getElementById("compose-view").style.display = "block";
              document.getElementById("new-email-title").style.display = "none";
              document.getElementById("reply-email-title").style.display = "block";
              document.getElementById("reply-title").innerHTML = email.sender;
              document.getElementById("compose-recipients").value = email.sender;
              let a = email.subject;
              //console.log(a.substr(0,3));
              if (a.substr(0,3) == "Re:") {
                document.getElementById("compose-subject").value = email.subject;
              } else {
                document.getElementById("compose-subject").value = "Re: " + email.subject;
              }
              //document.getElementById("compose-subject").value = "Re: " + email.subject;
              document.getElementById("compose-recipients").disabled = true;
              document.getElementById("compose-subject").disabled = true;
              document.getElementById("compose-body").value = "On " + email.timestamp + " " + email.sender + " wrote: " + email.body;
            }
            document.getElementById("archive-btn").onclick =()=> {
              console.log(email.id);
              fetch(`/emails/${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: true
                })
              })
              .then(response => response.json())
              .then(data => {
                console.log(data);
                load_mailbox('inbox');
              });
            }
          }
          inboxEmail.append(viewBtn);
          const inboxEmailTime = document.createElement('span');
          inboxEmailTime.innerHTML = email.timestamp;
          inboxEmailTime.classList.add('time');
          inboxEmail.append(inboxEmailTime);
        })
      }
    });

  } 

  if (mailbox == "sent") {

    // Load Sent
  fetch('/emails/sent')
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
      // ... do something else with emails ...
      //console.log(emails[0])
      if (emails == "") {
        const message = document.createElement('span');
        message.classList.add('message');
        message.innerHTML = "You haven't sent any emails";
        document.getElementById("emails-cont").append(message);
      } else {
        emails.forEach(function(email) {
          const sentEmail = document.createElement('div');
          sentEmail.classList.add('email-div-read');
          document.getElementById("emails-cont").append(sentEmail);
          const sentEmailRecipients = document.createElement('b');
          sentEmailRecipients.innerHTML = email.recipients;
          sentEmailRecipients.classList.add('sender');
          sentEmail.append(sentEmailRecipients);
          const sentEmailSubject = document.createElement('span');
          sentEmailSubject.innerHTML = email.subject;
          sentEmail.append(sentEmailSubject);
          const viewSentBtn = document.createElement('button');
          viewSentBtn.classList.add('view-email');
          viewSentBtn.innerHTML = "View";
          viewSentBtn.onclick =()=> {
            console.log(email);
            document.getElementById("email-title").style.display = "none";
            document.getElementById("emails-cont").style.display = "none";
            document.getElementById("email").style.display = "block";
            document.getElementById("from").innerHTML = email.sender;
            document.getElementById("to").innerHTML = email.recipients;
            document.getElementById("subject").innerHTML = email.subject;
            document.getElementById("time").innerHTML = email.timestamp;
            document.getElementById("body").innerHTML = email.body;
            document.getElementById("archive-btn").style.display = "none";
            document.getElementById("reply").style.display = "none";
            document.getElementById("unarchive-btn").style.display = "none";
          }
          sentEmail.append(viewSentBtn);
          const sentEmailTime = document.createElement('span');
          sentEmailTime.innerHTML = email.timestamp;
          sentEmailTime.classList.add('time');
          sentEmail.append(sentEmailTime);
        })
      }
    });

  } 
  
  if (mailbox == "archive") {

    // Load Archive
    fetch('/emails/archive')
    .then(response => response.json())
    .then(emails => {
        // Print emails
        console.log(emails);
        // ... do something else with emails ...
        //console.log(emails[0])
        if (emails == "") {
          const message = document.createElement('span');
          message.classList.add('message');
          message.innerHTML = "Your archive is empty";
          document.getElementById("emails-cont").append(message);
        } else {
          emails.forEach(function(email) {
            const archiveEmail = document.createElement('div');
            archiveEmail.classList.add('email-div-read');
            document.getElementById("emails-cont").append(archiveEmail);
            const archiveEmailSender = document.createElement('b');
            archiveEmailSender.innerHTML = email.sender;
            archiveEmailSender.classList.add('sender');
            archiveEmail.append(archiveEmailSender);
            const archiveEmailSubject = document.createElement('span');
            archiveEmailSubject.innerHTML = email.subject;
            archiveEmail.append(archiveEmailSubject);
            const viewArchiveBtn = document.createElement('button');
            viewArchiveBtn.classList.add('view-email');
            viewArchiveBtn.innerHTML = "View";
            viewArchiveBtn.onclick =()=> {
              console.log(email)
              document.getElementById("email-title").style.display = "none";
              document.getElementById("emails-cont").style.display = "none";
              document.getElementById("email").style.display = "block";
              document.getElementById("from").innerHTML = email.sender;
              document.getElementById("to").innerHTML = email.recipients;
              document.getElementById("subject").innerHTML = email.subject;
              document.getElementById("time").innerHTML = email.timestamp;
              document.getElementById("body").innerHTML = email.body;
              document.getElementById("archive-btn").style.display = "none";
              document.getElementById("reply").style.display = "none";
              document.getElementById("unarchive-btn").style.display = "block";
              document.getElementById("unarchive-btn").onclick =()=> {
                console.log(email.id);
                fetch(`/emails/${email.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                    archived: false
                  })
                })
                .then(response => response.json())
                .then(data => {
                console.log(data);
                load_mailbox('inbox');
                });
              }
            }
            archiveEmail.append(viewArchiveBtn);
            const archiveEmailTime = document.createElement('span');
            archiveEmailTime.innerHTML = email.timestamp;
            archiveEmailTime.classList.add('time');
            archiveEmail.append(archiveEmailTime);
          })
      }
    });

  }

}

