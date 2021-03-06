var _ = require('lodash');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();

/**
 * S3 bucket names are global to *all* AWS users. Collision probability is
 * reduced by prepending schema names with the selfhub URL. The 'schema'
 * keyword is also included in the prefix to distinguish schema buckets from
 * other storage buckets that might be in use.
 * @constant
 * @default
 * @type {string}
 */
var BUCKET_PREFIX = 'selfhub-io-schema-';

/**
 * Get the bucket name corresponding to a schema name.
 * @param {string} schemaName the schema name
 * @returns {!string}
 */
var getBucketNameForSchemaName = function(schemaName) {
  return BUCKET_PREFIX + schemaName;
};

/**
 * Get the schema name corresponding to a bucket name
 * @param {string} bucketName the bucket name
 * @returns {?string}
 */
var getSchemaNameForBucketName = function(bucketName) {
  var prefixLength = BUCKET_PREFIX.length;
  if (bucketName && bucketName.substring(0, prefixLength) === BUCKET_PREFIX) {
    return bucketName.substring(prefixLength);
  }
  return null;
};

/**
 * The AWS S3 callback
 * @callback s3Callback
 * @param {Object} error the error response
 * @param {Object} data the data response
 */

/**
 * AWS S3 CRUD operations
 * @module server/db/s3
 */
module.exports = {
  /* CREATE operations */

  /**
   * Create a schema.
   * @param {string} schemaName the schema name
   * @param {s3Callback} callback the callback that handles the AWS response
   */
  createSchema: function(schemaName, callback) {
    var bucketName = getBucketNameForSchemaName(schemaName);
    s3.createBucket({Bucket: bucketName}, callback);
  },

  /**
   * Create a schema entry.
   * @param {string} schemaName the schema name
   * @param {string} userID the userID
   * @param {string} data the entry data
   * @param {s3Callback} callback the callback that handles the AWS response
   */
  createEntry: function(schemaName, userID, data, callback) {
    var params = {
      Bucket: schemaName,
      Key: userID,
      Body: data
    };
    s3.putObject(params, callback);
  },

  /* READ operations */

  /**
   * Get the list of schemas.
   * @param {s3Callback} callback the callback that handles the AWS response
   */
  getSchemas: function(callback) {
    s3.listBuckets(function(error, data) {
      if (error) { callback(error); }
      var schemaNames = _.chain(data.Buckets)
        .pluck('Name')
        .transform(function(result, bucketName) {
          var schemaName = getSchemaNameForBucketName(bucketName);
          if (schemaName) {
            result.push(schemaName);
          }
        })
        .value();
      callback(error, schemaNames);
    });
  },

  /**
   * Get the entry associated with a schema and a userID.
   * @param {string} schemaName the schema name
   * @param {string} userID the userID
   * @param {s3Callback} callback the callback that handles the AWS response
   */
  getEntry: function(schemaName, userID, callback) {
    var bucketName = getBucketNameForSchemaName(schemaName);
    var params = {
      Bucket: bucketName,
      Key: userID
    };
    s3.getObject(params, callback);
  },

  /**
   * Get the list of userIDs that have data for a schema.
   * @param {string} schemaName the schema name
   * @param {s3Callback} callback the callback that handles the AWS response
   */
  getEntriesForSchema: function(schemaName, callback) {
    var bucketName = getBucketNameForSchemaName(schemaName);
    var params = {Bucket: bucketName};
    s3.listObjects(params, callback);
  },

  /* UPDATE operations */

  // TODO: support incremental updates (#92)

  /* DELETE operations */

  /**
   * Delete a schema (along with all of its entries).
   * @param {string} schemaName the schema name
   * @param {s3Callback} callback the callback that handles the AWS response
   */
  deleteSchema: function(schemaName, callback) {
    var bucketName = getBucketNameForSchemaName(schemaName);
    s3.deleteBucket({Bucket: bucketName}, callback);
  },

  /**
   * Delete the userID's entry from the schema.
   * @param {string} schemaName the schema name
   * @param {string} userID the userID
   * @param {s3Callback} callback the callback that handles the AWS response
   */
  deleteEntry: function(schemaName, userID, callback) {
    var bucketName = getBucketNameForSchemaName(schemaName);
    var params = {
      Bucket: bucketName,
      Key: userID
    };
    s3.deleteObject(params, callback);
  }
};
