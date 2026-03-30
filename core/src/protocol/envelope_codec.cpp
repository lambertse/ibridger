#include "ibridger/protocol/envelope_codec.h"

namespace ibridger {
namespace protocol {

EnvelopeCodec::EnvelopeCodec(std::shared_ptr<FramedConnection> conn)
    : conn_(std::move(conn)) {}

std::error_code EnvelopeCodec::send(const ibridger::Envelope& envelope) {
    std::string bytes;
    if (!envelope.SerializeToString(&bytes)) {
        // Serialization failure is extremely rare (only if required fields
        // are missing in proto2; proto3 always succeeds).
        return std::make_error_code(std::errc::invalid_argument);
    }
    return conn_->send_frame(bytes);
}

std::pair<ibridger::Envelope, std::error_code> EnvelopeCodec::recv() {
    auto [bytes, frame_err] = conn_->recv_frame();
    if (frame_err) {
        return {ibridger::Envelope{}, frame_err};
    }

    ibridger::Envelope envelope;
    if (!envelope.ParseFromString(bytes)) {
        return {ibridger::Envelope{}, std::make_error_code(std::errc::bad_message)};
    }

    return {std::move(envelope), {}};
}

} // namespace protocol
} // namespace ibridger
