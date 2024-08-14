const _ = require("underscore");
const axios = require("axios").default;
const Response = require("../helpers/response");
const Constant = require("../helpers/constant");
const querystring = require("querystring");

const { LINKEDIN_REDIRECT_URL, LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET } =
  process.env;

const linkedinVerify = async (req, res, next) => {
  // get the token from frontend
  const { token } = req.body;

  const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
    params: {
      grant_type: 'authorization_code',
      code: token,
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      redirect_uri: `${process.env.LINKEDIN_REDIRECT_URL}`,
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    transformRequest: [(data, headers) => {
      // delete headers.common['Accept']; // Fix axios issue with content negotiation
      return querystring.stringify(data);
    }],
  }).catch((error) => console.error('Accesstotken error', error));

  const accessToken = response.data.access_token;


  // Make a request to the LinkedIn API using the access token
  const result = await axios.get('https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~digitalmediaAsset:playableStreams))', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  }).catch((error) => console.error('Ye le error', error));

  const picture = result.data?.profilePicture && result.data?.profilePicture["displayImage~"] ? result.data?.profilePicture["displayImage~"]?.elements[0]?.identifiers[0]?.identifier : null;
  const name = result.data.localizedFirstName + ' ' + result.data.localizedLastName ;
  // get the user's email address
  const emailRequest = await axios.get(
    "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))&oauth2_access_token=" +
      accessToken
  );
  const email = emailRequest.data.elements[0]["handle~"].emailAddress;

  if (email) {
    req.body = {...req.body, name , email, picture, email_verified: true}
    next();
  } else {
    const obj = {
      res,
      status: Constant.STATUS_CODE.BAD_REQUEST,
      msg: Constant.ERROR_MSGS.LINKEDIN_AUTHENTICATION_FAILED,
    };
    return Response.error(obj);
  }
};

module.exports = { linkedinVerify };
