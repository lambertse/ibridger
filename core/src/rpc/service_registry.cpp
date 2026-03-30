#include "ibridger/rpc/service_registry.h"

namespace ibridger {
namespace rpc {

std::error_code ServiceRegistry::register_service(std::shared_ptr<IService> service) {
    std::lock_guard<std::mutex> lock(mutex_);

    const auto& svc_name = service->name();
    if (services_.count(svc_name)) {
        return std::make_error_code(std::errc::file_exists);
    }

    services_.emplace(svc_name, std::move(service));
    return {};
}

std::shared_ptr<IService> ServiceRegistry::find_service(const std::string& name) const {
    std::lock_guard<std::mutex> lock(mutex_);

    auto it = services_.find(name);
    return it != services_.end() ? it->second : nullptr;
}

std::vector<ibridger::ServiceDescriptor> ServiceRegistry::list_services() const {
    std::lock_guard<std::mutex> lock(mutex_);

    std::vector<ibridger::ServiceDescriptor> descriptors;
    descriptors.reserve(services_.size());

    for (const auto& [name, service] : services_) {
        ibridger::ServiceDescriptor desc;
        desc.set_name(name);
        for (const auto& method : service->methods()) {
            desc.add_methods(method);
        }
        descriptors.push_back(std::move(desc));
    }

    return descriptors;
}

size_t ServiceRegistry::size() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return services_.size();
}

} // namespace rpc
} // namespace ibridger
