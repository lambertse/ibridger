/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
(function(global, factory) { /* global define, require, module */

    /* AMD */ if (typeof define === 'function' && define.amd)
        define(["protobufjs/minimal"], factory);

    /* CommonJS */ else if (typeof require === 'function' && typeof module === 'object' && module && module.exports)
        module.exports = factory(require("protobufjs/minimal"));

})(this, function($protobuf) {
    "use strict";

    // Common aliases
    var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
    
    // Exported root namespace
    var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
    
    $root.ibridger = (function() {
    
        /**
         * Namespace ibridger.
         * @exports ibridger
         * @namespace
         */
        var ibridger = {};
    
        /**
         * MessageType enum.
         * @name ibridger.MessageType
         * @enum {number}
         * @property {number} REQUEST=0 REQUEST value
         * @property {number} RESPONSE=1 RESPONSE value
         * @property {number} EVENT=2 EVENT value
         * @property {number} ERROR=3 ERROR value
         */
        ibridger.MessageType = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "REQUEST"] = 0;
            values[valuesById[1] = "RESPONSE"] = 1;
            values[valuesById[2] = "EVENT"] = 2;
            values[valuesById[3] = "ERROR"] = 3;
            return values;
        })();
    
        /**
         * StatusCode enum.
         * @name ibridger.StatusCode
         * @enum {number}
         * @property {number} OK=0 OK value
         * @property {number} UNKNOWN_ERROR=1 UNKNOWN_ERROR value
         * @property {number} NOT_FOUND=2 NOT_FOUND value
         * @property {number} INVALID_ARGUMENT=3 INVALID_ARGUMENT value
         * @property {number} INTERNAL=4 INTERNAL value
         * @property {number} TIMEOUT=5 TIMEOUT value
         */
        ibridger.StatusCode = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "OK"] = 0;
            values[valuesById[1] = "UNKNOWN_ERROR"] = 1;
            values[valuesById[2] = "NOT_FOUND"] = 2;
            values[valuesById[3] = "INVALID_ARGUMENT"] = 3;
            values[valuesById[4] = "INTERNAL"] = 4;
            values[valuesById[5] = "TIMEOUT"] = 5;
            return values;
        })();
    
        ibridger.Envelope = (function() {
    
            /**
             * Properties of an Envelope.
             * @memberof ibridger
             * @interface IEnvelope
             * @property {ibridger.MessageType|null} [type] Envelope type
             * @property {Long|null} [requestId] Envelope requestId
             * @property {string|null} [serviceName] Envelope serviceName
             * @property {string|null} [methodName] Envelope methodName
             * @property {Uint8Array|null} [payload] Envelope payload
             * @property {ibridger.StatusCode|null} [status] Envelope status
             * @property {string|null} [errorMessage] Envelope errorMessage
             * @property {Object.<string,string>|null} [metadata] Envelope metadata
             */
    
            /**
             * Constructs a new Envelope.
             * @memberof ibridger
             * @classdesc Represents an Envelope.
             * @implements IEnvelope
             * @constructor
             * @param {ibridger.IEnvelope=} [properties] Properties to set
             */
            function Envelope(properties) {
                this.metadata = {};
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * Envelope type.
             * @member {ibridger.MessageType} type
             * @memberof ibridger.Envelope
             * @instance
             */
            Envelope.prototype.type = 0;
    
            /**
             * Envelope requestId.
             * @member {Long} requestId
             * @memberof ibridger.Envelope
             * @instance
             */
            Envelope.prototype.requestId = $util.Long ? $util.Long.fromBits(0,0,true) : 0;
    
            /**
             * Envelope serviceName.
             * @member {string} serviceName
             * @memberof ibridger.Envelope
             * @instance
             */
            Envelope.prototype.serviceName = "";
    
            /**
             * Envelope methodName.
             * @member {string} methodName
             * @memberof ibridger.Envelope
             * @instance
             */
            Envelope.prototype.methodName = "";
    
            /**
             * Envelope payload.
             * @member {Uint8Array} payload
             * @memberof ibridger.Envelope
             * @instance
             */
            Envelope.prototype.payload = $util.newBuffer([]);
    
            /**
             * Envelope status.
             * @member {ibridger.StatusCode} status
             * @memberof ibridger.Envelope
             * @instance
             */
            Envelope.prototype.status = 0;
    
            /**
             * Envelope errorMessage.
             * @member {string} errorMessage
             * @memberof ibridger.Envelope
             * @instance
             */
            Envelope.prototype.errorMessage = "";
    
            /**
             * Envelope metadata.
             * @member {Object.<string,string>} metadata
             * @memberof ibridger.Envelope
             * @instance
             */
            Envelope.prototype.metadata = $util.emptyObject;
    
            /**
             * Creates a new Envelope instance using the specified properties.
             * @function create
             * @memberof ibridger.Envelope
             * @static
             * @param {ibridger.IEnvelope=} [properties] Properties to set
             * @returns {ibridger.Envelope} Envelope instance
             */
            Envelope.create = function create(properties) {
                return new Envelope(properties);
            };
    
            /**
             * Encodes the specified Envelope message. Does not implicitly {@link ibridger.Envelope.verify|verify} messages.
             * @function encode
             * @memberof ibridger.Envelope
             * @static
             * @param {ibridger.IEnvelope} message Envelope message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Envelope.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
                if (message.requestId != null && Object.hasOwnProperty.call(message, "requestId"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.requestId);
                if (message.serviceName != null && Object.hasOwnProperty.call(message, "serviceName"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.serviceName);
                if (message.methodName != null && Object.hasOwnProperty.call(message, "methodName"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.methodName);
                if (message.payload != null && Object.hasOwnProperty.call(message, "payload"))
                    writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.payload);
                if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                    writer.uint32(/* id 6, wireType 0 =*/48).int32(message.status);
                if (message.errorMessage != null && Object.hasOwnProperty.call(message, "errorMessage"))
                    writer.uint32(/* id 7, wireType 2 =*/58).string(message.errorMessage);
                if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                    for (var keys = Object.keys(message.metadata), i = 0; i < keys.length; ++i)
                        writer.uint32(/* id 8, wireType 2 =*/66).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.metadata[keys[i]]).ldelim();
                return writer;
            };
    
            /**
             * Encodes the specified Envelope message, length delimited. Does not implicitly {@link ibridger.Envelope.verify|verify} messages.
             * @function encodeDelimited
             * @memberof ibridger.Envelope
             * @static
             * @param {ibridger.IEnvelope} message Envelope message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Envelope.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes an Envelope message from the specified reader or buffer.
             * @function decode
             * @memberof ibridger.Envelope
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {ibridger.Envelope} Envelope
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Envelope.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ibridger.Envelope(), key, value;
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.type = reader.int32();
                            break;
                        }
                    case 2: {
                            message.requestId = reader.uint64();
                            break;
                        }
                    case 3: {
                            message.serviceName = reader.string();
                            break;
                        }
                    case 4: {
                            message.methodName = reader.string();
                            break;
                        }
                    case 5: {
                            message.payload = reader.bytes();
                            break;
                        }
                    case 6: {
                            message.status = reader.int32();
                            break;
                        }
                    case 7: {
                            message.errorMessage = reader.string();
                            break;
                        }
                    case 8: {
                            if (message.metadata === $util.emptyObject)
                                message.metadata = {};
                            var end2 = reader.uint32() + reader.pos;
                            key = "";
                            value = "";
                            while (reader.pos < end2) {
                                var tag2 = reader.uint32();
                                switch (tag2 >>> 3) {
                                case 1:
                                    key = reader.string();
                                    break;
                                case 2:
                                    value = reader.string();
                                    break;
                                default:
                                    reader.skipType(tag2 & 7);
                                    break;
                                }
                            }
                            message.metadata[key] = value;
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes an Envelope message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof ibridger.Envelope
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {ibridger.Envelope} Envelope
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Envelope.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies an Envelope message.
             * @function verify
             * @memberof ibridger.Envelope
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Envelope.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.type != null && message.hasOwnProperty("type"))
                    switch (message.type) {
                    default:
                        return "type: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        break;
                    }
                if (message.requestId != null && message.hasOwnProperty("requestId"))
                    if (!$util.isInteger(message.requestId) && !(message.requestId && $util.isInteger(message.requestId.low) && $util.isInteger(message.requestId.high)))
                        return "requestId: integer|Long expected";
                if (message.serviceName != null && message.hasOwnProperty("serviceName"))
                    if (!$util.isString(message.serviceName))
                        return "serviceName: string expected";
                if (message.methodName != null && message.hasOwnProperty("methodName"))
                    if (!$util.isString(message.methodName))
                        return "methodName: string expected";
                if (message.payload != null && message.hasOwnProperty("payload"))
                    if (!(message.payload && typeof message.payload.length === "number" || $util.isString(message.payload)))
                        return "payload: buffer expected";
                if (message.status != null && message.hasOwnProperty("status"))
                    switch (message.status) {
                    default:
                        return "status: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                        break;
                    }
                if (message.errorMessage != null && message.hasOwnProperty("errorMessage"))
                    if (!$util.isString(message.errorMessage))
                        return "errorMessage: string expected";
                if (message.metadata != null && message.hasOwnProperty("metadata")) {
                    if (!$util.isObject(message.metadata))
                        return "metadata: object expected";
                    var key = Object.keys(message.metadata);
                    for (var i = 0; i < key.length; ++i)
                        if (!$util.isString(message.metadata[key[i]]))
                            return "metadata: string{k:string} expected";
                }
                return null;
            };
    
            /**
             * Creates an Envelope message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof ibridger.Envelope
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {ibridger.Envelope} Envelope
             */
            Envelope.fromObject = function fromObject(object) {
                if (object instanceof $root.ibridger.Envelope)
                    return object;
                var message = new $root.ibridger.Envelope();
                switch (object.type) {
                default:
                    if (typeof object.type === "number") {
                        message.type = object.type;
                        break;
                    }
                    break;
                case "REQUEST":
                case 0:
                    message.type = 0;
                    break;
                case "RESPONSE":
                case 1:
                    message.type = 1;
                    break;
                case "EVENT":
                case 2:
                    message.type = 2;
                    break;
                case "ERROR":
                case 3:
                    message.type = 3;
                    break;
                }
                if (object.requestId != null)
                    if ($util.Long)
                        (message.requestId = $util.Long.fromValue(object.requestId)).unsigned = true;
                    else if (typeof object.requestId === "string")
                        message.requestId = parseInt(object.requestId, 10);
                    else if (typeof object.requestId === "number")
                        message.requestId = object.requestId;
                    else if (typeof object.requestId === "object")
                        message.requestId = new $util.LongBits(object.requestId.low >>> 0, object.requestId.high >>> 0).toNumber(true);
                if (object.serviceName != null)
                    message.serviceName = String(object.serviceName);
                if (object.methodName != null)
                    message.methodName = String(object.methodName);
                if (object.payload != null)
                    if (typeof object.payload === "string")
                        $util.base64.decode(object.payload, message.payload = $util.newBuffer($util.base64.length(object.payload)), 0);
                    else if (object.payload.length >= 0)
                        message.payload = object.payload;
                switch (object.status) {
                default:
                    if (typeof object.status === "number") {
                        message.status = object.status;
                        break;
                    }
                    break;
                case "OK":
                case 0:
                    message.status = 0;
                    break;
                case "UNKNOWN_ERROR":
                case 1:
                    message.status = 1;
                    break;
                case "NOT_FOUND":
                case 2:
                    message.status = 2;
                    break;
                case "INVALID_ARGUMENT":
                case 3:
                    message.status = 3;
                    break;
                case "INTERNAL":
                case 4:
                    message.status = 4;
                    break;
                case "TIMEOUT":
                case 5:
                    message.status = 5;
                    break;
                }
                if (object.errorMessage != null)
                    message.errorMessage = String(object.errorMessage);
                if (object.metadata) {
                    if (typeof object.metadata !== "object")
                        throw TypeError(".ibridger.Envelope.metadata: object expected");
                    message.metadata = {};
                    for (var keys = Object.keys(object.metadata), i = 0; i < keys.length; ++i)
                        message.metadata[keys[i]] = String(object.metadata[keys[i]]);
                }
                return message;
            };
    
            /**
             * Creates a plain object from an Envelope message. Also converts values to other types if specified.
             * @function toObject
             * @memberof ibridger.Envelope
             * @static
             * @param {ibridger.Envelope} message Envelope
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Envelope.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.objects || options.defaults)
                    object.metadata = {};
                if (options.defaults) {
                    object.type = options.enums === String ? "REQUEST" : 0;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.requestId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.requestId = options.longs === String ? "0" : 0;
                    object.serviceName = "";
                    object.methodName = "";
                    if (options.bytes === String)
                        object.payload = "";
                    else {
                        object.payload = [];
                        if (options.bytes !== Array)
                            object.payload = $util.newBuffer(object.payload);
                    }
                    object.status = options.enums === String ? "OK" : 0;
                    object.errorMessage = "";
                }
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $root.ibridger.MessageType[message.type] === undefined ? message.type : $root.ibridger.MessageType[message.type] : message.type;
                if (message.requestId != null && message.hasOwnProperty("requestId"))
                    if (typeof message.requestId === "number")
                        object.requestId = options.longs === String ? String(message.requestId) : message.requestId;
                    else
                        object.requestId = options.longs === String ? $util.Long.prototype.toString.call(message.requestId) : options.longs === Number ? new $util.LongBits(message.requestId.low >>> 0, message.requestId.high >>> 0).toNumber(true) : message.requestId;
                if (message.serviceName != null && message.hasOwnProperty("serviceName"))
                    object.serviceName = message.serviceName;
                if (message.methodName != null && message.hasOwnProperty("methodName"))
                    object.methodName = message.methodName;
                if (message.payload != null && message.hasOwnProperty("payload"))
                    object.payload = options.bytes === String ? $util.base64.encode(message.payload, 0, message.payload.length) : options.bytes === Array ? Array.prototype.slice.call(message.payload) : message.payload;
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = options.enums === String ? $root.ibridger.StatusCode[message.status] === undefined ? message.status : $root.ibridger.StatusCode[message.status] : message.status;
                if (message.errorMessage != null && message.hasOwnProperty("errorMessage"))
                    object.errorMessage = message.errorMessage;
                var keys2;
                if (message.metadata && (keys2 = Object.keys(message.metadata)).length) {
                    object.metadata = {};
                    for (var j = 0; j < keys2.length; ++j)
                        object.metadata[keys2[j]] = message.metadata[keys2[j]];
                }
                return object;
            };
    
            /**
             * Converts this Envelope to JSON.
             * @function toJSON
             * @memberof ibridger.Envelope
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Envelope.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for Envelope
             * @function getTypeUrl
             * @memberof ibridger.Envelope
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Envelope.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/ibridger.Envelope";
            };
    
            return Envelope;
        })();
    
        ibridger.Ping = (function() {
    
            /**
             * Properties of a Ping.
             * @memberof ibridger
             * @interface IPing
             * @property {string|null} [clientId] Ping clientId
             */
    
            /**
             * Constructs a new Ping.
             * @memberof ibridger
             * @classdesc Represents a Ping.
             * @implements IPing
             * @constructor
             * @param {ibridger.IPing=} [properties] Properties to set
             */
            function Ping(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * Ping clientId.
             * @member {string} clientId
             * @memberof ibridger.Ping
             * @instance
             */
            Ping.prototype.clientId = "";
    
            /**
             * Creates a new Ping instance using the specified properties.
             * @function create
             * @memberof ibridger.Ping
             * @static
             * @param {ibridger.IPing=} [properties] Properties to set
             * @returns {ibridger.Ping} Ping instance
             */
            Ping.create = function create(properties) {
                return new Ping(properties);
            };
    
            /**
             * Encodes the specified Ping message. Does not implicitly {@link ibridger.Ping.verify|verify} messages.
             * @function encode
             * @memberof ibridger.Ping
             * @static
             * @param {ibridger.IPing} message Ping message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Ping.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.clientId != null && Object.hasOwnProperty.call(message, "clientId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.clientId);
                return writer;
            };
    
            /**
             * Encodes the specified Ping message, length delimited. Does not implicitly {@link ibridger.Ping.verify|verify} messages.
             * @function encodeDelimited
             * @memberof ibridger.Ping
             * @static
             * @param {ibridger.IPing} message Ping message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Ping.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a Ping message from the specified reader or buffer.
             * @function decode
             * @memberof ibridger.Ping
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {ibridger.Ping} Ping
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Ping.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ibridger.Ping();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.clientId = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a Ping message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof ibridger.Ping
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {ibridger.Ping} Ping
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Ping.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a Ping message.
             * @function verify
             * @memberof ibridger.Ping
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Ping.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.clientId != null && message.hasOwnProperty("clientId"))
                    if (!$util.isString(message.clientId))
                        return "clientId: string expected";
                return null;
            };
    
            /**
             * Creates a Ping message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof ibridger.Ping
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {ibridger.Ping} Ping
             */
            Ping.fromObject = function fromObject(object) {
                if (object instanceof $root.ibridger.Ping)
                    return object;
                var message = new $root.ibridger.Ping();
                if (object.clientId != null)
                    message.clientId = String(object.clientId);
                return message;
            };
    
            /**
             * Creates a plain object from a Ping message. Also converts values to other types if specified.
             * @function toObject
             * @memberof ibridger.Ping
             * @static
             * @param {ibridger.Ping} message Ping
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Ping.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.clientId = "";
                if (message.clientId != null && message.hasOwnProperty("clientId"))
                    object.clientId = message.clientId;
                return object;
            };
    
            /**
             * Converts this Ping to JSON.
             * @function toJSON
             * @memberof ibridger.Ping
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Ping.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for Ping
             * @function getTypeUrl
             * @memberof ibridger.Ping
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Ping.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/ibridger.Ping";
            };
    
            return Ping;
        })();
    
        ibridger.Pong = (function() {
    
            /**
             * Properties of a Pong.
             * @memberof ibridger
             * @interface IPong
             * @property {string|null} [serverId] Pong serverId
             * @property {Long|null} [timestampMs] Pong timestampMs
             */
    
            /**
             * Constructs a new Pong.
             * @memberof ibridger
             * @classdesc Represents a Pong.
             * @implements IPong
             * @constructor
             * @param {ibridger.IPong=} [properties] Properties to set
             */
            function Pong(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * Pong serverId.
             * @member {string} serverId
             * @memberof ibridger.Pong
             * @instance
             */
            Pong.prototype.serverId = "";
    
            /**
             * Pong timestampMs.
             * @member {Long} timestampMs
             * @memberof ibridger.Pong
             * @instance
             */
            Pong.prototype.timestampMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;
    
            /**
             * Creates a new Pong instance using the specified properties.
             * @function create
             * @memberof ibridger.Pong
             * @static
             * @param {ibridger.IPong=} [properties] Properties to set
             * @returns {ibridger.Pong} Pong instance
             */
            Pong.create = function create(properties) {
                return new Pong(properties);
            };
    
            /**
             * Encodes the specified Pong message. Does not implicitly {@link ibridger.Pong.verify|verify} messages.
             * @function encode
             * @memberof ibridger.Pong
             * @static
             * @param {ibridger.IPong} message Pong message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Pong.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.serverId != null && Object.hasOwnProperty.call(message, "serverId"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.serverId);
                if (message.timestampMs != null && Object.hasOwnProperty.call(message, "timestampMs"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int64(message.timestampMs);
                return writer;
            };
    
            /**
             * Encodes the specified Pong message, length delimited. Does not implicitly {@link ibridger.Pong.verify|verify} messages.
             * @function encodeDelimited
             * @memberof ibridger.Pong
             * @static
             * @param {ibridger.IPong} message Pong message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Pong.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a Pong message from the specified reader or buffer.
             * @function decode
             * @memberof ibridger.Pong
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {ibridger.Pong} Pong
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Pong.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ibridger.Pong();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.serverId = reader.string();
                            break;
                        }
                    case 2: {
                            message.timestampMs = reader.int64();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a Pong message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof ibridger.Pong
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {ibridger.Pong} Pong
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Pong.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a Pong message.
             * @function verify
             * @memberof ibridger.Pong
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Pong.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.serverId != null && message.hasOwnProperty("serverId"))
                    if (!$util.isString(message.serverId))
                        return "serverId: string expected";
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (!$util.isInteger(message.timestampMs) && !(message.timestampMs && $util.isInteger(message.timestampMs.low) && $util.isInteger(message.timestampMs.high)))
                        return "timestampMs: integer|Long expected";
                return null;
            };
    
            /**
             * Creates a Pong message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof ibridger.Pong
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {ibridger.Pong} Pong
             */
            Pong.fromObject = function fromObject(object) {
                if (object instanceof $root.ibridger.Pong)
                    return object;
                var message = new $root.ibridger.Pong();
                if (object.serverId != null)
                    message.serverId = String(object.serverId);
                if (object.timestampMs != null)
                    if ($util.Long)
                        (message.timestampMs = $util.Long.fromValue(object.timestampMs)).unsigned = false;
                    else if (typeof object.timestampMs === "string")
                        message.timestampMs = parseInt(object.timestampMs, 10);
                    else if (typeof object.timestampMs === "number")
                        message.timestampMs = object.timestampMs;
                    else if (typeof object.timestampMs === "object")
                        message.timestampMs = new $util.LongBits(object.timestampMs.low >>> 0, object.timestampMs.high >>> 0).toNumber();
                return message;
            };
    
            /**
             * Creates a plain object from a Pong message. Also converts values to other types if specified.
             * @function toObject
             * @memberof ibridger.Pong
             * @static
             * @param {ibridger.Pong} message Pong
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Pong.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.serverId = "";
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.timestampMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.timestampMs = options.longs === String ? "0" : 0;
                }
                if (message.serverId != null && message.hasOwnProperty("serverId"))
                    object.serverId = message.serverId;
                if (message.timestampMs != null && message.hasOwnProperty("timestampMs"))
                    if (typeof message.timestampMs === "number")
                        object.timestampMs = options.longs === String ? String(message.timestampMs) : message.timestampMs;
                    else
                        object.timestampMs = options.longs === String ? $util.Long.prototype.toString.call(message.timestampMs) : options.longs === Number ? new $util.LongBits(message.timestampMs.low >>> 0, message.timestampMs.high >>> 0).toNumber() : message.timestampMs;
                return object;
            };
    
            /**
             * Converts this Pong to JSON.
             * @function toJSON
             * @memberof ibridger.Pong
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Pong.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for Pong
             * @function getTypeUrl
             * @memberof ibridger.Pong
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Pong.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/ibridger.Pong";
            };
    
            return Pong;
        })();
    
        ibridger.ServiceDescriptor = (function() {
    
            /**
             * Properties of a ServiceDescriptor.
             * @memberof ibridger
             * @interface IServiceDescriptor
             * @property {string|null} [name] ServiceDescriptor name
             * @property {Array.<string>|null} [methods] ServiceDescriptor methods
             */
    
            /**
             * Constructs a new ServiceDescriptor.
             * @memberof ibridger
             * @classdesc Represents a ServiceDescriptor.
             * @implements IServiceDescriptor
             * @constructor
             * @param {ibridger.IServiceDescriptor=} [properties] Properties to set
             */
            function ServiceDescriptor(properties) {
                this.methods = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * ServiceDescriptor name.
             * @member {string} name
             * @memberof ibridger.ServiceDescriptor
             * @instance
             */
            ServiceDescriptor.prototype.name = "";
    
            /**
             * ServiceDescriptor methods.
             * @member {Array.<string>} methods
             * @memberof ibridger.ServiceDescriptor
             * @instance
             */
            ServiceDescriptor.prototype.methods = $util.emptyArray;
    
            /**
             * Creates a new ServiceDescriptor instance using the specified properties.
             * @function create
             * @memberof ibridger.ServiceDescriptor
             * @static
             * @param {ibridger.IServiceDescriptor=} [properties] Properties to set
             * @returns {ibridger.ServiceDescriptor} ServiceDescriptor instance
             */
            ServiceDescriptor.create = function create(properties) {
                return new ServiceDescriptor(properties);
            };
    
            /**
             * Encodes the specified ServiceDescriptor message. Does not implicitly {@link ibridger.ServiceDescriptor.verify|verify} messages.
             * @function encode
             * @memberof ibridger.ServiceDescriptor
             * @static
             * @param {ibridger.IServiceDescriptor} message ServiceDescriptor message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ServiceDescriptor.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                if (message.methods != null && message.methods.length)
                    for (var i = 0; i < message.methods.length; ++i)
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.methods[i]);
                return writer;
            };
    
            /**
             * Encodes the specified ServiceDescriptor message, length delimited. Does not implicitly {@link ibridger.ServiceDescriptor.verify|verify} messages.
             * @function encodeDelimited
             * @memberof ibridger.ServiceDescriptor
             * @static
             * @param {ibridger.IServiceDescriptor} message ServiceDescriptor message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ServiceDescriptor.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a ServiceDescriptor message from the specified reader or buffer.
             * @function decode
             * @memberof ibridger.ServiceDescriptor
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {ibridger.ServiceDescriptor} ServiceDescriptor
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ServiceDescriptor.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ibridger.ServiceDescriptor();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.name = reader.string();
                            break;
                        }
                    case 2: {
                            if (!(message.methods && message.methods.length))
                                message.methods = [];
                            message.methods.push(reader.string());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a ServiceDescriptor message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof ibridger.ServiceDescriptor
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {ibridger.ServiceDescriptor} ServiceDescriptor
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ServiceDescriptor.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a ServiceDescriptor message.
             * @function verify
             * @memberof ibridger.ServiceDescriptor
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ServiceDescriptor.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.methods != null && message.hasOwnProperty("methods")) {
                    if (!Array.isArray(message.methods))
                        return "methods: array expected";
                    for (var i = 0; i < message.methods.length; ++i)
                        if (!$util.isString(message.methods[i]))
                            return "methods: string[] expected";
                }
                return null;
            };
    
            /**
             * Creates a ServiceDescriptor message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof ibridger.ServiceDescriptor
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {ibridger.ServiceDescriptor} ServiceDescriptor
             */
            ServiceDescriptor.fromObject = function fromObject(object) {
                if (object instanceof $root.ibridger.ServiceDescriptor)
                    return object;
                var message = new $root.ibridger.ServiceDescriptor();
                if (object.name != null)
                    message.name = String(object.name);
                if (object.methods) {
                    if (!Array.isArray(object.methods))
                        throw TypeError(".ibridger.ServiceDescriptor.methods: array expected");
                    message.methods = [];
                    for (var i = 0; i < object.methods.length; ++i)
                        message.methods[i] = String(object.methods[i]);
                }
                return message;
            };
    
            /**
             * Creates a plain object from a ServiceDescriptor message. Also converts values to other types if specified.
             * @function toObject
             * @memberof ibridger.ServiceDescriptor
             * @static
             * @param {ibridger.ServiceDescriptor} message ServiceDescriptor
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ServiceDescriptor.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.methods = [];
                if (options.defaults)
                    object.name = "";
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.methods && message.methods.length) {
                    object.methods = [];
                    for (var j = 0; j < message.methods.length; ++j)
                        object.methods[j] = message.methods[j];
                }
                return object;
            };
    
            /**
             * Converts this ServiceDescriptor to JSON.
             * @function toJSON
             * @memberof ibridger.ServiceDescriptor
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ServiceDescriptor.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * Gets the default type url for ServiceDescriptor
             * @function getTypeUrl
             * @memberof ibridger.ServiceDescriptor
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ServiceDescriptor.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/ibridger.ServiceDescriptor";
            };
    
            return ServiceDescriptor;
        })();
    
        return ibridger;
    })();

    return $root;
});
