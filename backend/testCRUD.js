const User = require('./models/User');
const Message = require('./models/Message');

// const Users = [];
// const Messages = [];

const mongoose = require('mongoose');
const UserService = require('./services/UserServices');


console.log("--------------------- start to test: -----------------------------");

const mongoDB = 'mongodb://127.0.0.1:27017/test';
// mongoose.set("strictQuery", false); // Prepare for Mongoose 7

main().catch((err) => console.log(err));

const user1 = { handle: 'APIuser1', email: 'API1@mail.com', password: 'abc123456' };
const user2 = { handle: 'APIuser2', email: 'API2@mail.com', password: 'abc223456' };
const user3 = { handle: 'APIuser3', email: 'API3@mail.com', password: 'abc323456' };
const user4 = { handle: 'APIuser4', email: 'API4@mail.com', password: 'abc423456' };
const user5 = { handle: 'APIuser5', email: 'API5@mail.com', password: 'abc523456' };

const user1_alter = { email: 'API1_alter@mail.com' };
const user2_alter = { email: 'API2_alter@mail.com' };
const user3_alter = { email: 'API3_alter@mail.com' };



async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);

  // await test1();
  await dataTestAll();  //used after test1, all tests(except for test1) use the test data here
  // await test2();
  // await test3();
  await test3();
  // await test4();
  // await test5();

  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}


/**************************************************************
*
*              
*                              tests
*
*
**************************************************************/


// test user create with API
async function test1() {
  await deleteAllUsers();
  // await createUserAPI();
  // await createUsers(); //mine vision
  await DisplayAllUser();
}

async function dataTestAll() {
  await deleteAllUsers();
  await createUsers();
  await DisplayAllUser();
}

// test get all user with API
async function test2() {
  await UserService.getUsers(); //ok
  // await DisplayAllUser(); //ok
}

// test get one user with API
async function test3() {
  console.log("start test3: \n");
  var t1 = await UserService.getUser({handle: 'test3'});
  console.log(t1.payload); 
  // await SearchUser('test3'); //ok
}

// test modify one user with API
async function test4() {
  await UserService.writeUser(user1_alter); 
  // await writeUser('test1', 'test1_alter@gmail.com'); //ok
  await SearchUser('test1');
}

// test delete one user with API
async function test5() {
  await UserService.deleteUser('test3'); 
  // await deleteUser('test3'); //ok
  await SearchUser('test3');
}

/**************************************************************
*
*              
*                           Cancellare  Delete
*
*
**************************************************************/

async function deleteAllMessages() {
  await Message.deleteMany().then(function () {
    console.log("Messages deleted"); // Success
  }).catch(function (error) {
    console.log(error); // Failure
  });
}

async function deleteAllUsers() {
  await User.deleteMany().then(function () {
    console.log("Users deleted"); // Success
  }).catch(function (error) {
    console.log(error); // Failure
  });
}

async function deleteUser(userHandle) { 
  await User.findOneAndDelete({
    handle: userHandle
  })
    .then((docs) => {
      console.log("deleted");
    })
    .catch((err) => {
      console.log(err);
    });
}


/**************************************************************
*
*              
*                         aggiungere update
*
*
**************************************************************/

async function writeUser(handle, email) {
  await User.findOneAndUpdate({
    handle: handle
  }, {
    $set: {
      email: email
    }
  }, {})
    .then((docs) => {
      console.log("Result :", docs);
    })
    .catch((err) => {
      console.log(err);
    });
}





/**************************************************************
*
*              
*                           Ricerca Search(read)
*
*
**************************************************************/


async function DisplayAllUser() {
  await User.find().then(result => console.log(result));
}
async function DisplayAllMessages() {
  await Message.find().then(result => console.log(result));
}



async function SearchUser(userHandle) {
  await User.findOne({ handle: userHandle })
    .then((docs) => {
      console.log("Result :", docs);
    })
    .catch((err) => {
      console.log(err);
    });

}

async function SearchMeassage(userHandle) {
}

async function SearchMeassageAPI(userHandle) {
  // await UserService.getUser(userHandle);
}

/**************************************************************
*
*              
*                           Creare Create
*
*
**************************************************************/

async function createTest() {
  await createUsers();
  await createMessages();

}
async function createUserAPI() {
  await UserService.createUser(user1);
  await UserService.createUser(user2);
  await UserService.createUser(user3);
  await UserService.createUser(user4);
  await UserService.createUser(user5);

  // await Promise.all([
  //   UserService.createUser(user1), 
  //   UserService.createUser(user2),
  //   UserService.createUser(user3),
  //   UserService.createUser(user4),
  //   UserService.createUser(user5)
  // ]);
}


/* user create */
async function userCreate(handle, email, password, messages) {
  userdetail = { handle: handle, email: email, password: password, messages: messages };

  const user = new User(userdetail);

  await user.save();
  // Users.push(user);
  console.log(`new user added: ${handle} ${email}`);
}
async function createUsers() {
  console.log("adding Users");
  await Promise.all([
    userCreate('test1', 'test1@gmail.com', 'abc123456'),
    userCreate('test2', 'test2@gmail.com', 'abc123454'),
    userCreate('test3', 'test3@gmail.com', 'abc1234568'),
    userCreate('test4', 'test4@gmail.com', 'abc123450'),
    userCreate('test5', 'test5@gmail.com', 'abc123459')
  ]);
}


/* message create */
async function messageCreate(content, dest) {
  messagedetail = { content: content, dest: dest };

  const message = new Message(messagedetail);

  await message.save();
  // Messages.push(message);
  console.log(`new massages added! ${content} ${dest}`);
}
async function createMessages() {
  console.log("Adding Messages");
  await Promise.all([
    messageCreate('Today is a good day.', '#Diary'),
    messageCreate('Today is a good day too.', '#Diary'),
    messageCreate('Today is a good day too, +1.', '#Diary'),
    messageCreate('Today is a good day too, +2.', '#Diary'),
    messageCreate('Today is a good day, too, +3', '#Diary'),
    messageCreate('Today is a good day, too, +4.', '#Diary'),
  ]);
}
