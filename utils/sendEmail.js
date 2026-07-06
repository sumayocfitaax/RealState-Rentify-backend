const sendEmail = async (options) => {
  try {
    const BREVO_API_KEY = process.env.BREVO_API_KEY?.trim();
    if(!BREVO_API_KEY){
      console.log('missing BREVO_API_KEY in the .env file');
      throw new Error('missing api key ')
    }

    const data = {
      sender: {
        name: 'Rentify Estate Platform',
        email: process.env.EMAIL_USER
      },
      to: [{ email: options.email }],
      subject: options.subject,
      htmlContent: options.message
    }

     const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if(response.ok) {
      console.log("Email sent successfully via Brevo:", error.message);
    }else{
      console.error("brevo api key:", result);
      throw new Error(result.message || 'Could not send Email via Brevo')
    }

  } catch (error) {
    console.error("Brevo Email Error:", error);
    throw error;
  }
  
}

module.exports = sendEmail