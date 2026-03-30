import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace ibridger. */
export namespace ibridger {

    /** MessageType enum. */
    enum MessageType {
        REQUEST = 0,
        RESPONSE = 1,
        EVENT = 2,
        ERROR = 3
    }

    /** StatusCode enum. */
    enum StatusCode {
        OK = 0,
        UNKNOWN_ERROR = 1,
        NOT_FOUND = 2,
        INVALID_ARGUMENT = 3,
        INTERNAL = 4,
        TIMEOUT = 5
    }

    /** Properties of an Envelope. */
    interface IEnvelope {

        /** Envelope type */
        type?: (ibridger.MessageType|null);

        /** Envelope requestId */
        requestId?: (Long|null);

        /** Envelope serviceName */
        serviceName?: (string|null);

        /** Envelope methodName */
        methodName?: (string|null);

        /** Envelope payload */
        payload?: (Uint8Array|null);

        /** Envelope status */
        status?: (ibridger.StatusCode|null);

        /** Envelope errorMessage */
        errorMessage?: (string|null);

        /** Envelope metadata */
        metadata?: ({ [k: string]: string }|null);
    }

    /** Represents an Envelope. */
    class Envelope implements IEnvelope {

        /**
         * Constructs a new Envelope.
         * @param [properties] Properties to set
         */
        constructor(properties?: ibridger.IEnvelope);

        /** Envelope type. */
        public type: ibridger.MessageType;

        /** Envelope requestId. */
        public requestId: Long;

        /** Envelope serviceName. */
        public serviceName: string;

        /** Envelope methodName. */
        public methodName: string;

        /** Envelope payload. */
        public payload: Uint8Array;

        /** Envelope status. */
        public status: ibridger.StatusCode;

        /** Envelope errorMessage. */
        public errorMessage: string;

        /** Envelope metadata. */
        public metadata: { [k: string]: string };

        /**
         * Creates a new Envelope instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Envelope instance
         */
        public static create(properties?: ibridger.IEnvelope): ibridger.Envelope;

        /**
         * Encodes the specified Envelope message. Does not implicitly {@link ibridger.Envelope.verify|verify} messages.
         * @param message Envelope message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: ibridger.IEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Envelope message, length delimited. Does not implicitly {@link ibridger.Envelope.verify|verify} messages.
         * @param message Envelope message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: ibridger.IEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Envelope message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Envelope
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ibridger.Envelope;

        /**
         * Decodes an Envelope message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Envelope
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ibridger.Envelope;

        /**
         * Verifies an Envelope message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Envelope message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Envelope
         */
        public static fromObject(object: { [k: string]: any }): ibridger.Envelope;

        /**
         * Creates a plain object from an Envelope message. Also converts values to other types if specified.
         * @param message Envelope
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: ibridger.Envelope, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Envelope to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Envelope
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Ping. */
    interface IPing {

        /** Ping clientId */
        clientId?: (string|null);
    }

    /** Represents a Ping. */
    class Ping implements IPing {

        /**
         * Constructs a new Ping.
         * @param [properties] Properties to set
         */
        constructor(properties?: ibridger.IPing);

        /** Ping clientId. */
        public clientId: string;

        /**
         * Creates a new Ping instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Ping instance
         */
        public static create(properties?: ibridger.IPing): ibridger.Ping;

        /**
         * Encodes the specified Ping message. Does not implicitly {@link ibridger.Ping.verify|verify} messages.
         * @param message Ping message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: ibridger.IPing, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Ping message, length delimited. Does not implicitly {@link ibridger.Ping.verify|verify} messages.
         * @param message Ping message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: ibridger.IPing, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Ping message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Ping
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ibridger.Ping;

        /**
         * Decodes a Ping message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Ping
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ibridger.Ping;

        /**
         * Verifies a Ping message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Ping message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Ping
         */
        public static fromObject(object: { [k: string]: any }): ibridger.Ping;

        /**
         * Creates a plain object from a Ping message. Also converts values to other types if specified.
         * @param message Ping
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: ibridger.Ping, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Ping to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Ping
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Pong. */
    interface IPong {

        /** Pong serverId */
        serverId?: (string|null);

        /** Pong timestampMs */
        timestampMs?: (Long|null);
    }

    /** Represents a Pong. */
    class Pong implements IPong {

        /**
         * Constructs a new Pong.
         * @param [properties] Properties to set
         */
        constructor(properties?: ibridger.IPong);

        /** Pong serverId. */
        public serverId: string;

        /** Pong timestampMs. */
        public timestampMs: Long;

        /**
         * Creates a new Pong instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Pong instance
         */
        public static create(properties?: ibridger.IPong): ibridger.Pong;

        /**
         * Encodes the specified Pong message. Does not implicitly {@link ibridger.Pong.verify|verify} messages.
         * @param message Pong message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: ibridger.IPong, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Pong message, length delimited. Does not implicitly {@link ibridger.Pong.verify|verify} messages.
         * @param message Pong message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: ibridger.IPong, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Pong message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Pong
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ibridger.Pong;

        /**
         * Decodes a Pong message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Pong
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ibridger.Pong;

        /**
         * Verifies a Pong message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Pong message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Pong
         */
        public static fromObject(object: { [k: string]: any }): ibridger.Pong;

        /**
         * Creates a plain object from a Pong message. Also converts values to other types if specified.
         * @param message Pong
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: ibridger.Pong, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Pong to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Pong
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ServiceDescriptor. */
    interface IServiceDescriptor {

        /** ServiceDescriptor name */
        name?: (string|null);

        /** ServiceDescriptor methods */
        methods?: (string[]|null);
    }

    /** Represents a ServiceDescriptor. */
    class ServiceDescriptor implements IServiceDescriptor {

        /**
         * Constructs a new ServiceDescriptor.
         * @param [properties] Properties to set
         */
        constructor(properties?: ibridger.IServiceDescriptor);

        /** ServiceDescriptor name. */
        public name: string;

        /** ServiceDescriptor methods. */
        public methods: string[];

        /**
         * Creates a new ServiceDescriptor instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ServiceDescriptor instance
         */
        public static create(properties?: ibridger.IServiceDescriptor): ibridger.ServiceDescriptor;

        /**
         * Encodes the specified ServiceDescriptor message. Does not implicitly {@link ibridger.ServiceDescriptor.verify|verify} messages.
         * @param message ServiceDescriptor message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: ibridger.IServiceDescriptor, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ServiceDescriptor message, length delimited. Does not implicitly {@link ibridger.ServiceDescriptor.verify|verify} messages.
         * @param message ServiceDescriptor message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: ibridger.IServiceDescriptor, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ServiceDescriptor message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ServiceDescriptor
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ibridger.ServiceDescriptor;

        /**
         * Decodes a ServiceDescriptor message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ServiceDescriptor
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ibridger.ServiceDescriptor;

        /**
         * Verifies a ServiceDescriptor message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ServiceDescriptor message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ServiceDescriptor
         */
        public static fromObject(object: { [k: string]: any }): ibridger.ServiceDescriptor;

        /**
         * Creates a plain object from a ServiceDescriptor message. Also converts values to other types if specified.
         * @param message ServiceDescriptor
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: ibridger.ServiceDescriptor, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ServiceDescriptor to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ServiceDescriptor
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** WireConstant enum. */
    enum WireConstant {
        WIRE_CONSTANT_UNSPECIFIED = 0,
        MAX_FRAME_SIZE = 16777216,
        DEFAULT_TIMEOUT_MS = 30000
    }

    /** Namespace examples. */
    namespace examples {

        /** Properties of an EchoRequest. */
        interface IEchoRequest {

            /** EchoRequest message */
            message?: (string|null);
        }

        /** Represents an EchoRequest. */
        class EchoRequest implements IEchoRequest {

            /**
             * Constructs a new EchoRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: ibridger.examples.IEchoRequest);

            /** EchoRequest message. */
            public message: string;

            /**
             * Creates a new EchoRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns EchoRequest instance
             */
            public static create(properties?: ibridger.examples.IEchoRequest): ibridger.examples.EchoRequest;

            /**
             * Encodes the specified EchoRequest message. Does not implicitly {@link ibridger.examples.EchoRequest.verify|verify} messages.
             * @param message EchoRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: ibridger.examples.IEchoRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EchoRequest message, length delimited. Does not implicitly {@link ibridger.examples.EchoRequest.verify|verify} messages.
             * @param message EchoRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: ibridger.examples.IEchoRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EchoRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EchoRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ibridger.examples.EchoRequest;

            /**
             * Decodes an EchoRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EchoRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ibridger.examples.EchoRequest;

            /**
             * Verifies an EchoRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EchoRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EchoRequest
             */
            public static fromObject(object: { [k: string]: any }): ibridger.examples.EchoRequest;

            /**
             * Creates a plain object from an EchoRequest message. Also converts values to other types if specified.
             * @param message EchoRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: ibridger.examples.EchoRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EchoRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for EchoRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an EchoResponse. */
        interface IEchoResponse {

            /** EchoResponse message */
            message?: (string|null);

            /** EchoResponse timestampMs */
            timestampMs?: (Long|null);
        }

        /** Represents an EchoResponse. */
        class EchoResponse implements IEchoResponse {

            /**
             * Constructs a new EchoResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: ibridger.examples.IEchoResponse);

            /** EchoResponse message. */
            public message: string;

            /** EchoResponse timestampMs. */
            public timestampMs: Long;

            /**
             * Creates a new EchoResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns EchoResponse instance
             */
            public static create(properties?: ibridger.examples.IEchoResponse): ibridger.examples.EchoResponse;

            /**
             * Encodes the specified EchoResponse message. Does not implicitly {@link ibridger.examples.EchoResponse.verify|verify} messages.
             * @param message EchoResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: ibridger.examples.IEchoResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EchoResponse message, length delimited. Does not implicitly {@link ibridger.examples.EchoResponse.verify|verify} messages.
             * @param message EchoResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: ibridger.examples.IEchoResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EchoResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EchoResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ibridger.examples.EchoResponse;

            /**
             * Decodes an EchoResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EchoResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ibridger.examples.EchoResponse;

            /**
             * Verifies an EchoResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EchoResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EchoResponse
             */
            public static fromObject(object: { [k: string]: any }): ibridger.examples.EchoResponse;

            /**
             * Creates a plain object from an EchoResponse message. Also converts values to other types if specified.
             * @param message EchoResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: ibridger.examples.EchoResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EchoResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for EchoResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}
