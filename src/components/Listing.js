import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useAuth0 } from "@auth0/auth0-react";

import { BACKEND_URL } from "../constants";

const Listing = () => {
  const [listingId, setListingId] = useState();
  const [listing, setListing] = useState({});
  const [currUser, setCurrUser] = useState({});
  const [accessToken, setAccessToken] = useState("");
  const {
    user,
    isAuthenticated,
    isLoading,
    logout,
    loginWithRedirect,
    getAccessTokenSilently,
  } = useAuth0();

  useEffect(() => {
    const checkLogin = async () => {
      const localAccess = JSON.parse(localStorage.getItem("Token"));

      if (localAccess) {
        setAccessToken(accessToken);
      } else if (isAuthenticated) {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: process.env.REACT_APP_AUDIENCE,
            scope: process.env.REACT_APP_SCOPE,
          },
        });
        console.log("This is access token ", accessToken);
        setAccessToken(accessToken);
      }

      if (isAuthenticated && accessToken !== null) {
        //login
        const userInfo = await axios.post(
          `${BACKEND_URL}/listings/login`,
          user
        );
        console.log(userInfo.data.checkedUser);
        if (userInfo != null) {
          setCurrUser(userInfo.data.checkedUser);
        }
      }
    };
    checkLogin();
    console.log(user);
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (accessToken !== null) {
      localStorage.setItem("Token", JSON.stringify(accessToken));
    }
  }, [accessToken]);

  useEffect(() => {
    const getListing = async () => {
      // If there is a listingId, retrieve the listing data
      if (listingId && accessToken !== null) {
        axios.get(`${BACKEND_URL}/listings/${listingId}`).then((response) => {
          setListing(response.data);
        });
      }
    };

    getListing();
    // Only r;un this effect on change to listingId
  }, [listingId]);

  // Update listing ID in state if needed to trigger data retrieval
  const params = useParams();
  if (listingId !== params.listingId) {
    setListingId(params.listingId);
  }

  // Store a new JSX element for each property in listing details
  const listingDetails = [];
  if (listing) {
    for (const key in listing) {
      listingDetails.push(
        <Card.Text key={key}>{`${key}: ${listing[key]}`}</Card.Text>
      );
    }
  }

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  const handleClick = async () => {
    if (isAuthenticated && accessToken !== null) {
      const output = await axios
        .put(`${BACKEND_URL}/listings/${listingId}`, currUser, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          setListing(response.data);
        });
      console.log(output);
    } else {
      loginWithRedirect();
    }
  };

  return (
    <div>
      <Link to="/">Home</Link>
      <Card bg="dark">
        <Card.Body>
          {isAuthenticated ? (
            <div>
              <button
                onClick={() => {
                  localStorage.removeItem("Token");
                  logout({
                    logoutParams: { returnTo: window.location.origin },
                  });
                }}
              >
                Log Out
              </button>
              <br />
              {/* <img src={user.picture} alt={user.name} /> */}
              <h2>Hello {user.name}!</h2>
              <p>Your registered email is {user.email}.</p>
            </div>
          ) : (
            <div>
              <h4>Please login if you wish to buy an item.</h4>
              <button onClick={() => loginWithRedirect()}>Log In</button>
            </div>
          )}
          {listingDetails}
          <Button onClick={handleClick} disabled={listing.BuyerId}>
            Buy this item
          </Button>
        </Card.Body>
      </Card>
      <br />
    </div>
  );
};

export default Listing;
