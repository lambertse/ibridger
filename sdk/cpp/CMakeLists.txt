add_library(ibridger_sdk_cpp STATIC
  src/ibridger_sdk.cpp
)

target_include_directories(ibridger_sdk_cpp PUBLIC
  ${CMAKE_CURRENT_SOURCE_DIR}/include
)

target_link_libraries(ibridger_sdk_cpp PUBLIC ibridger_core)
