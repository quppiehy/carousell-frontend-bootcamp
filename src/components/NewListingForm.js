import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import { BACKEND_URL } from "../constants";

const NewListingForm = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [shippingDetails, setShippingDetails] = useState("");
  const [currUser, setCurrUser] = useState({});
  const [accessToken, setAccessToken] = useState([]);

  // const [user, setUser] = useState("");
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoading,
    logout,
    loginWithRedirect,
    getAccessTokenSilently,
  } = useAuth0();
  // const [userMetadata, setUserMetadata] = useState(null);

  useEffect(() => {
    const checkLogin = async () => {
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.REACT_APP_AUDIENCE,
          scope: process.env.REACT_APP_SCOPE,
        },
      });
      setAccessToken(accessToken);
      // }
      console.log("Access Token : ", accessToken);
      console.log("User: ", user);
      if (
        isAuthenticated &&
        accessToken !== null &&
        typeof user.email !== "undefined"
      ) {
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

  const handleChange = (event) => {
    switch (event.target.name) {
      case "title":
        setTitle(event.target.value);
        break;
      case "category":
        setCategory(event.target.value);
        break;
      case "condition":
        setCondition(event.target.value);
        break;
      case "price":
        setPrice(event.target.value);
        break;
      case "description":
        setDescription(event.target.value);
        break;
      case "shippingDetails":
        setShippingDetails(event.target.value);
        break;
      default:
    }
  };

  const handleSubmit = async (event) => {
    // Prevent default form redirect on submission
    console.log(currUser);
    event.preventDefault();

    //   {
    //   // TODO: Replace with your own app's audience. Should be same as API identifier in above steps.
    //   audience: "https://carousell/api",
    //   scope: "read:current_user",
    // }

    if (isAuthenticated && accessToken !== null) {
      const objToSend = {
        title,
        category,
        condition,
        price,
        description,
        shippingDetails,
        currUser,
      };

      // Send request to create new listing in backend
      const output = await axios
        .post(`${BACKEND_URL}/listings`, objToSend, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          // Clear form state
          console.log(output);
          setTitle("");
          setCategory("");
          setCondition("");
          setPrice(0);
          setDescription("");
          setShippingDetails("");
          // Navigate to listing-specific page after submitting form
          navigate(`/listings/${res.data.id}`);
        });
    } else {
      loginWithRedirect();
    }
  };

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    <Form onSubmit={handleSubmit}>
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
          <h4>Please login to list a new listing.</h4>
          <button onClick={() => loginWithRedirect()}>Log In</button>
        </div>
      )}
      <br />
      <Form.Group>
        <Form.Label>Title</Form.Label>
        <Form.Control
          type="text"
          name="title"
          value={title}
          onChange={handleChange}
          placeholder="iPhone 13, like new!"
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Category</Form.Label>
        <Form.Control
          type="text"
          name="category"
          value={category}
          onChange={handleChange}
          placeholder="Electronics"
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Condition</Form.Label>
        <Form.Control
          type="text"
          name="condition"
          value={condition}
          onChange={handleChange}
          placeholder="Like New"
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Price ($)</Form.Label>
        <Form.Control
          type="text"
          name="price"
          value={price}
          onChange={handleChange}
          placeholder="999"
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          name="description"
          value={description}
          onChange={handleChange}
          placeholder="Bought 2 months ago, selling because switching to Android."
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Shipping Details</Form.Label>
        <Form.Control
          as="textarea"
          name="shippingDetails"
          value={shippingDetails}
          onChange={handleChange}
          placeholder="Same day shipping, we can message to coordinate!"
        />
      </Form.Group>

      <Button variant="primary" type="submit">
        List this item
      </Button>
    </Form>
  );
};

export default NewListingForm;
