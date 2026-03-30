cmake_minimum_required(VERSION 3.20)
project(iBridger VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

option(IBRIDGER_BUILD_TESTS "Build unit tests" OFF)
option(IBRIDGER_BUILD_EXAMPLES "Build example applications" OFF)

if(IBRIDGER_BUILD_TESTS)
  enable_testing()
endif()

include(cmake/Dependencies.cmake)

add_subdirectory(proto)
add_subdirectory(core)
add_subdirectory(sdk/cpp)
