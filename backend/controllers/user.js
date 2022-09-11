/**
 * @file Controller code for the user API
 * @author Umar Abdul
 */

import dotenv from 'dotenv';
dotenv.config();
import User, * as model from '../models/user.js';

const REGISTRATION_KEY = global.REGISTRATION_KEY;
const PERM_ERROR = {error: "Permission denied!"}

export const createUser = (req, res) => {
  
  if (req.body.regKey !== REGISTRATION_KEY)
    return res.status(403).json({error: "Invalid registration key!"});
  model.createUser(req.body.username, req.body.password).then(user => {
    return res.json({success: "User created!"});
  }).catch(error => {
    return res.status(403).json({error: error.message});
  });
};

export const loginUser = (req, res) => {

  model.loginUser(req.body.username, req.body.password).then(async (user) => {
    model.setupSession(req.session, user);
    const token = await model.createToken(user.username);
    return res.json({
      username: user.username,
      admin: user.admin,
      token
    });
  }).catch(error => {
    return res.status(403).json({error: "Authentication failed!"});
  });
};

export const logoutUser = (req, res) => {
  
  const socketObjects = global.socketObjects;
  if (req.session.loggedIn){
    socketObjects[req.session.username].disconnect(true); // Close the web socket connection for the user.
    model.deleteToken(req.session.username);
    req.session.destroy();
    return res.json({success: "You have been logged out!"});
  }else{
    return res.status(403).json(PERM_ERROR);
  }
};
