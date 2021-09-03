
const MESSAGES = require('./Messages');
const UserModel = require('../administrators/models/users.model');
const LanguageModel = require('../administrators/models/languages.model');
const WebsiteModel = require('../administrators/models/websites.model');
const PageModel = require('../administrators/models/pages.model');
const { lang } = require('moment');
exports.validUser = async (user, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!user.email || !isEmail(user.email)) {
        return reject(MESSAGES.ERROR_EMAIL);
      }
      if (!id) {
        if (!user.password || !minLength(user.password, 8) || !validPassword(user.password)) {
          return reject(MESSAGES.ERROR_PASSWORD);
        }
      }
      if (!user.firstName || !required(user.firstName)) {
        return reject(MESSAGES.ERROR_REQUIRED_FIRSTNAME);
      }
      if (!user.lastName || !required(user.lastName)) {
        return reject(MESSAGES.ERROR_REQUIRED_LASTNAME);
      }
      const userData = await UserModel.findByEmailAndId(user.email, id) || {};
      if (userData._id && id && userData._id === id) {
        return reject(MESSAGES.ERROR_EMAIL_EXISTS);
      }
      if (userData._id && !id) {
        return reject(MESSAGES.ERROR_EMAIL_EXISTS);
      }
      return resolve({ success: true });
    } catch (error) {
      return reject(error);
    }
  });
}

exports.validLanuage = async (language, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!language.name || !required(language.name)) {
        return reject(MESSAGES.ERROR_REQUIRED_NAME);
      }
      if (!language.code || !required(language.code)) {
        return reject(MESSAGES.ERROR_REQUIRED_CODE);
      }

      // let condition = { code: language.code }
      // if (id) {
      //   condition._id = { $ne: id };
      // }

      // const langData = await LanguageModel.findOne(condition) || {};
      // if (langData._id) {
      //   return reject(MESSAGES.ERROR_CODE_EXISTS);
      // }
      return resolve({ success: true });
    } catch (error) {
      return reject(error);
    }
  });
}


exports.validCategory = async (data, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.title) {
        return reject(MESSAGES.ERROR_REQUIRED_TITLE);
      }
      if (!data.slug || !required(data.slug)) {
        return reject(MESSAGES.ERROR_REQUIRED_SLUG);
      }

      let condition = { slug: data.slug }
      condition.website = data.website;
      if (id) {
        condition._id = { $ne: id };
      }

      const CategoryModel = require('../administrators/models/datahub.model');
      const catData = await CategoryModel.findOne(condition) || {};
      if (catData._id) {
        return reject(MESSAGES.ERROR_SLUG_EXISTS);
      }
      return resolve({ success: true });
    } catch (error) {
      return reject(error);
    }
  });
}

exports.validPost = async (post, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!post.title) {
        return reject(MESSAGES.ERROR_REQUIRED_TITLE);
      }

      if (!post.slug || !required(post.slug)) {
        return reject(MESSAGES.ERROR_REQUIRED_SLUG);
      }

      if (!post.datahub || post.datahub.length === 0) {
        return reject(MESSAGES.ERROR_REQUIRED_CATEGORY);
      }

      let condition = { slug: post.slug }
      condition.website = post.website;
      if (id) {
        condition._id = { $ne: id };
      }

      const PostModel = require('../administrators/models/posts.model');
      const data = await PostModel.findOne(condition) || {};
      if (data._id) {
        return reject(MESSAGES.ERROR_SLUG_EXISTS);
      }
      return resolve({ success: true });
    } catch (error) {
      return reject(error);
    }
  });
}

exports.validRole = async (post, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!post.name) {
        return reject(MESSAGES.ERROR_REQUIRED_NAME);
      }
      return resolve({ success: true });
    } catch (error) {
      return reject(error);
    }
  });
}

exports.validWebsite = async (data, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.code || !required(data.code)) {
        return reject(MESSAGES.ERROR_REQUIRED_CODE);
      }
      let condition = { code: data.code }
      if (id) {
        condition._id = { $ne: id };
      }
      const langData = await WebsiteModel.findOne(condition) || {};
      if (langData._id) {
        return reject(MESSAGES.ERROR_CODE_EXISTS);
      }
      return resolve({ success: true });
    } catch (error) {
      return reject(error);
    }
  });
}

exports.validPage = async (data, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.code || !required(data.code)) {
        return reject(MESSAGES.ERROR_REQUIRED_CODE);
      }
      if (!data.name || !required(data.name)) {
        return reject(MESSAGES.ERROR_REQUIRED_CODE);
      }
      let condition = { code: data.code }
      if (id) {
        condition._id = { $ne: id };
      }
      const pageData = await PageModel.findOne(condition) || {};
      if (pageData._id) {
        return reject(MESSAGES.ERROR_CODE_EXISTS);
      }
      return resolve({ success: true });
    } catch (error) {
      return reject(error);
    }
  });
}

const isEmail = (value) => {
  const filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
  if (filter.test(value)) {
    return true;
  }
  return false;
}

const required = (value) => {
  if (value === null || value.toString().trim() === '') {
    return false;
  }
  return true;
}

const minLength = (value, length) => {
  if (value && value.length >= length) {
    return true;
  }
  return false;
}

const maxLength = (value, length) => {
  if (value && value.length <= length) {
    return true;
  }
  return false;
}

const exlength = (value, length) => {
  if (value && value.length === length) {
    return true;
  }
  return false;
}

const match = (value1, value2) => {
  if (value1 === value2) {
    return true;
  }

  return false;
}

const number = (value) => {
  if (!value || value === '') return true;
  const regex = /^\d+$/;
  return regex.test(value);
}

const currency = (value) => {
  if (!value || value === '') return true;
  const regex = /^[0-9]\d*(?:\.\d{0,4})?$/;

  return regex.test(value);
}

const isFloat = (value) => {
  if (!value || value === '') return true;
  const regex = /^[0-9]\d*(?:\.\d{0,10})?$/;

  return regex.test(value);
}

const validPassword = (value) => {
  if (!value || value === '') return true;
  const regex = /^.*(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W){8,}/
  return regex.test(value);
}

// const validPassword = value => {
//   const regex = /^.*(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+=]).*$/
//   return regex.test(value);
// }

const weight = (value) => {
  if (!value || value === '') return true;
  const regex = /^[1-9]\d*(?:\.\d{0,3})?$/;
  return regex.test(value);
}