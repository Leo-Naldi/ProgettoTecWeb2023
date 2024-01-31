import API from "src/common/apiconfig";
import { getUserHandle } from "./localStorageHandler";
import { GOOGLEKEY } from "./myGlobals";
import { showPositive, showNegative } from "./utils";
import useValidation from "./validation";


/**************************************
 *                                    *
 *                Plan                *
 *                                    *
 **************************************/
export async function getPlans() {
  return await API.get_plans()
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }
    })
    .catch((err) => {
      console.log("fetch all plan error!!!", err);
    });
}

export async function changePlan(submit_data) {
  const user_handle = getUserHandle();
  if (user_handle) {
    return await API.buy_plan(user_handle, submit_data)
      .then((response) => {
        if (response.status === 200) {
          return response.data;
        }
      })
      .catch((err) => {
        console.log("buy plan error!!!", err);
      });
  } else {
    return null;
  }
}

/*
    TODO: changePlan
    async changePlan() {},
    */
export async function cancelPlan() {
  const user_handle = getUserHandle();
  if (user_handle) {
    return await API.delete_plan(user_handle)
      .then((response) => {
        if (response.status === 200) {
          return response.data;
        }
      })
      .catch((err) => {
        console.log("cancel plan error!!!", err);
      });
  } else {
    return null;
  }
}


/**************************************
 *                                    *
 *                User                *
 *                                    *
 **************************************/
export async function fetchUser(user_name) {
  // console.log("fetchUSer param：", user_name)
  try {
    const response = await API.user(user_name);
    return response.data;
  } catch (error) {
    console.log("search user name error!!!", error);
    throw error;
  }
}

export async function fetchUserLiked(user_name) {
  try {
    const response = await API.search_user_liked(user_name);
    // console.log("fetchUserLiked res：", response.data, user_name)
    return response.data.results;
  } catch (error) {
    console.log("search user liked posts error!!!", error);
    throw error;
  }
}

export async function userhandleToJson(arr_user) {
  try {
    const promises = arr_user.map((handle) => API.user(handle));
    const responses = await Promise.all(promises);
    const new_arr = responses.map((obj) => {
      return obj.data;
    });
    return new_arr;
  } catch (error) {
    console.log("project user handle to user json error!!!", error);
    throw error;
  }
}

export async function userReactionsToJson(arr_liked) {
  if (arr_liked.length > 0) {
    try {
      const promises = arr_liked.map((id) => API.message(id));
      const responses = await Promise.all(promises);
      const new_arr = responses.map((obj) => {
        return obj.data;
      });
      return new_arr;
    } catch (error) {
      console.log("projec post id to post json error!!!", error);
      throw error;
    }
  }
  else return []
}


export async function searchUser(user) {
  user = user[0] == "#" ? "%23" + user.substring(1) : user;

  try {
    const response = await API.search_user(user);
    console.log("【requestsHandler.js】的 searchUser res: ", response.data.results);
    return response.data.results;
  } catch (error) {
    console.log("fetch post con 'text' error!!!", error);
    throw error;
  }
}

// return json array
export async function fetchUserJoinedChannels() {
  try {
    const user_handle = getUserHandle();
    const response = await API.get_joined_channels(user_handle);
    return response.data;
  } catch (error) {
    console.log("search user name error!!!", error);
    throw error;
  }
}

export async function fetchUserCreatedChannels() {
  try {
    const user_handle = getUserHandle();
    const response = await API.get_created_channels(user_handle);
    return response.data;
  } catch (error) {
    console.log("search user name error!!!", error);
    throw error;
  }
}

export async function fetchUserEditedChannels() {
  try {
    const user_handle = getUserHandle();
    const response = await API.get_edited_channels(user_handle);
    return response.data;
  } catch (error) {
    console.log("userEdited channels error!!!", error);
    throw error;
  }
}

export async function writeUser(userJson) {
  const user_handle = getUserHandle();
  if (user_handle) {
    return await API.write_user(user_handle, userJson)
      .then((response) => {
        if (response.status === 200) {
          showPositive(
            "You've modified your data successfully!"
          );
        }
      })
      .catch((err) => {
        console.log("modify user data error!!!", err);
        showNegative(
          "Modify your data failed! Please try it again!"
        );
      });
  } else {
    return null;
  }
}

export async function modifyEmail(email) {
  const user_handle = getUserHandle();
  if (user_handle) {
    if (useValidation().email(email.email) == true) {
      return await API.write_user(user_handle, email)
        .then((response) => {
          if (response.status === 200) {
            showPositive(
              "You've changed email to " +
              JSON.parse(JSON.stringify(email)).email +
              " successfully!"
            );
          }
        })
        .catch((err) => {
          console.log("modify user mail error!!!", err);
          showNegative(
            "Change email failed! Please try it latter!"
          );
        });
    }
    else {
      showNegative("email format not correct! Please check and insert again!"+email)
    }
  } else {
    return null;
  }
}

export async function verifyAccount(email, handle, token) {
  var submitionForm = { email: email, handle: handle, token: token };
  return await API.verifyAccount(submitionForm)
    .then((response) => {
      if (response.status === 200) {
        console.log(
          "send verify account mail: ",
          response,
          "【" + email + " , " + handle + " , " + token + "】"
        );
        showPositive(
          "Verification mail has already send to your mail address, please check your mailbox!"
        );
        return response.status;
      }
    })
    .catch((err) => {
      console.log("send verify account mail failed: ", err);
      showNegative(
        "send verify account mail failed with error:" + err
      );
      return err.response.status;
    });
}

export async function verifyAccountFeedBack(handle, email, verification_url) {
  var submitionForm = {
    handle: handle,
    email: email,
    verification_url: verification_url,
  };
  return await API.verifyAccountFeedback(submitionForm)
    .then((response) => {
      if (response.status === 200) {
        console.log("verified con success!", response);
        showPositive(
          "You've already verified your account!"
        );
        return response.status;
      }
    })
    .catch((err) => {
      if (err.response.status === 409) {
        showNegative(
          "verify account failed!<br/>Please get retry!"
        );
        return err.response.status;
      } else {
        console.log("verify account failed: ", err);
      }
    });
}

/**************************************
 *                                    *
 *              Channel               *
 *                                    *
 **************************************/

export async function channelNameToJson(arr_channel_name) {
  try {
    const promises = arr_channel_name.map((channel_name) => API.channel(channel_name));
    const responses = await Promise.all(promises);
    const new_arr = responses.map((obj) => {
      return obj.data;
    });
    return new_arr;
  } catch (error) {
    console.log("project channel name to channel json error!!!", error);
    throw error;
  }
}

export async function modifyChannel(channel_name, channel_data) {
  return await API.modify_channel(channel_name, channel_data)
    .then((response) => {
      if (response.status === 200) {
        showPositive(
          "You've modified channel data successfully!"
        );
        return response.status;
      }
    })
    .catch((err) => {
      console.log("modify channel data error!!!", err);
      showNegative(
        "Modify channel data failed! Please try it again!"
      );
      return err.response.status;
    });
}

export async function searchChannel(channel_name) {
  channel_name =
    channel_name[0] == "#"
      ? "%23" + channel_name.substring(1)
      : channel_name;

  try {
    const response = await API.search_channel(channel_name);
    // console.log("searchChannel res: ", response.data.results);
    return response.data.results;
  } catch (error) {
    console.log("search channel name error!!!", error);
    throw error;
  }
}

/**************************************
 *                                    *
 *                Post                *
 *                                    *
 **************************************/
export async function markReactions(idPos, idNeg, posts) {
  return posts.map(obj2 => {
    if (idPos.includes(obj2.id)) {
      return { ...obj2, liked: true };
    }
    if (idNeg.includes(obj2.id)) {
      return { ...obj2, disliked: true };
    }
    return obj2;
  });
}

/**************************************
 *                                    *
 *              Hashtag               *
 *                                    *
 **************************************/
// given coordinates, find country
export async function getCountryFromLocation(location) {
  // const test1= "https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key="+process.env.GOOGLEKEY
  // const response = await fetch(test1)
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location[0]},${location[1]}&key=${GOOGLEKEY}`
  );
  const data = await response.json();
  if (data.results.length > 0) {
    const country = data.results[0].address_components.find((component) =>
      component.types.includes("country")
    );
    return country ? country.short_name : "";
  }
  return "";
}
