add_library(ibridger_core STATIC
  src/ibridger.cpp
)

target_include_directories(ibridger_core PUBLIC
  ${CMAKE_CURRENT_SOURCE_DIR}/include
)

target_link_libraries(ibridger_core PUBLIC ibridger_proto)

if(IBRIDGER_BUILD_TESTS)
  add_subdirectory(tests)
endif()
