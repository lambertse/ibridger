add_executable(ibridger_benchmarks unix_socket_rpc.cpp)

target_link_libraries(ibridger_benchmarks PRIVATE
  ibridger_core
  benchmark::benchmark_main
)

# Reuse the test_transport_pair.h helper (make_endpoint / cleanup_endpoint)
target_include_directories(ibridger_benchmarks PRIVATE
  ${CMAKE_CURRENT_SOURCE_DIR}/../tests
)
