cmake
===

跨平台构建系统生成器

## 补充说明

**cmake** 是开源的跨平台构建系统生成器，通过 CMakeLists.txt 配置文件生成特定平台的构建文件（如 Makefile、Visual Studio 项目）。是现代 C/C++ 项目的主流构建工具。

### 语法

```shell
cmake [OPTIONS] <source_dir>
cmake [OPTIONS] -B <build_dir> -S <source_dir>
cmake --build <build_dir> [OPTIONS]
```

### 基本项目结构

```
project/
├── CMakeLists.txt
├── src/
│   ├── main.cpp
│   └── utils.cpp
├── include/
│   ├── main.h
│   └── utils.h
└── build/          # 构建目录
```

### 最小 CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.16)

# 项目名称和版本
project(MyProject VERSION 1.0.0 LANGUAGES CXX)

# 设置 C++ 标准
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 添加可执行文件
add_executable(myapp src/main.cpp)

# 包含目录
target_include_directories(myapp PRIVATE ${CMAKE_SOURCE_DIR}/include)

# 链接库
target_link_libraries(myapp PRIVATE pthread)
```

### 常用命令

```cmake
# 项目信息
cmake_minimum_required(VERSION 3.16)
project(ProjectName VERSION 1.0.0 LANGUAGES C CXX)

# 设置变量
set(VAR_NAME value)
set(VAR_NAME value1 value2 value3)

# 条件设置
option(BUILD_TESTS "Enable tests" ON)
set(ENABLE_FEATURE OFF CACHE BOOL "Enable feature")

# 列表操作
list(APPEND MY_LIST "item1" "item2")
list(GET MY_LIST 0 1 VAR1 VAR2)
list(LENGTH MY_LIST LEN)
list(REMOVE_ITEM MY_LIST "item1")

# 添加子目录
add_subdirectory(src)
add_subdirectory(tests)

# 包含文件
include(CMakeLists.txt.in)
include_directories(path)              # 全局包含目录
target_include_directories(target PRIVATE path)  # 目标特定
```

### 添加源文件

```cmake
# 添加可执行文件
add_executable(app main.cpp utils.cpp)

# 添加静态库
add_library(static_lib STATIC utils.cpp)

# 添加共享库
add_library(shared_lib SHARED utils.cpp)

# 添加头文件库（仅头文件）
add_library(header_lib INTERFACE)
target_include_directories(header_lib INTERFACE include/)

# 从模式添加文件
file(GLOB SOURCES "src/*.cpp")
add_executable(app ${SOURCES})

# 递归添加
file(GLOB_RECURSE SOURCES "src/*.cpp" "src/*.c")

# 排除文件
file(GLOB SOURCES "src/*.cpp")
list(FILTER SOURCES EXCLUDE REGEX "test_.*")
```

### 包含目录和链接库

```cmake
# 包含目录
include_directories(${CMAKE_SOURCE_DIR}/include)
include_directories(BEFORE ${CMAKE_SOURCE_DIR}/src)

# 目标包含目录
target_include_directories(myapp
    PUBLIC
        ${CMAKE_SOURCE_DIR}/include
    PRIVATE
        ${CMAKE_SOURCE_DIR}/src
)

# 链接库
target_link_libraries(myapp
    PUBLIC
        ${CMAKE_SOURCE_DIR}/lib/libfoo.a
    PRIVATE
        pthread
)

# 链接多个库
target_link_libraries(myapp
    lib1
    lib2
    ${CMAKE_DL_LIBS}    # dlopen
)

# 查找库
find_library(LIB_NAME NAMES foo PATHS /usr/lib)
target_link_libraries(myapp ${LIB_NAME})

# 查找包（使用 pkg-config）
find_package(PkgConfig REQUIRED)
pkg_check_modules(GTK3 REQUIRED gtk+-3.0)
target_include_directories(myapp PRIVATE ${GTK3_INCLUDE_DIRS})
target_link_libraries(myapp PRIVATE ${GTK3_LIBRARIES})
```

### 条件编译

```cmake
# 简单条件
if(WIN32)
    # Windows 特定
elseif(UNIX)
    # Unix 特定
endif()

# 变量判断
if(VAR)
    # VAR 非空或 ON/YES/TRUE
endif()

# 变量比较
if(VAR1 STREQUAL VAR2)
if(VAR1 EQUAL VAR2)        # 数值比较
if(VAR1 LESS VAR2)          # 数值小于
if(VAR1 GREATER VAR2)       # 数值大于
if(VAR1 MATCHES REGEX)      # 正则匹配

# 选项
option(ENABLE_TESTS "Build tests" ON)
option(BUILD_SHARED_LIBS "Build shared libraries" OFF)

# 平台检测
if(WIN32)
    set(PLATFORM_LIBS advapi32)
elseif(APPLE)
    set(PLATFORM_LIBS "-framework Cocoa")
elseif(UNIX)
    set(PLATFORM_LIBS pthread)
endif()
```

### 生成器表达式

```cmake
# 条件包含目录
target_include_directories(myapp
    PRIVATE
        $<$<CONFIG:Debug>:${DEBUG_INCLUDES}>
        $<$<CONFIG:Release>:${RELEASE_INCLUDES}>
)

# 条件定义
target_compile_definitions(myapp
    PRIVATE
        $<$<CONFIG:Debug>:DEBUG_MODE=1>
        $<$<CONFIG:Release>:NDEBUG>
)

# 条件链接
target_link_libraries(myapp
    PRIVATE
        $<$<BOOL:${ENABLE_TLS}>:OpenSSL::SSL>
)
```

### 测试

```cmake
# 启用测试
enable_testing()

# 添加测试
add_executable(test_app tests/test.cpp)
target_link_libraries(test_app PRIVATE doctest)  # 或 catch2, gtest

add_test(NAME MyTest COMMAND test_app)

# 测试命令
add_test(NAME mytest COMMAND python ${CMAKE_SOURCE_DIR}/test.py)

# 自定义测试命令
add_test(NAME coverage COMMAND python coverage.py)
set_tests_properties(coverage PROPERTIES TIMEOUT 300)
```

### 安装

```cmake
# 安装目标
install(TARGETS myapp mylib
    RUNTIME DESTINATION bin
    LIBRARY DESTINATION lib
    ARCHIVE DESTINATION lib
    PUBLIC_HEADER DESTINATION include/myproject
)

# 安装文件
install(FILES header.h DESTINATION include)
install(FILES config.conf DESTINATION etc)

# 安装目录
install(DIRECTORY data/ DESTINATION share/myproject/data)
install(DIRECTORY icons/ DESTINATION share/icons FILES_MATCHING PATTERN "*.png")

# 安装 CMake 配置
include(GNUInstallDirs)
install(EXPORT MyTargets FILE MyTargets.cmake DESTINATION cmake)
export(TARGETS mylib FILE MyTargets.cmake)
```

### 交叉编译

```cmake
# 工具链文件 toolchain.cmake
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_C_COMPILER arm-linux-gnueabi-gcc)
set(CMAKE_CXX_COMPILER arm-linux-gnueabi-g++)
set(CMAKE_FIND_ROOT_PATH /path/to/sysroot)

# 使用工具链
cmake -B build -DCMAKE_TOOLCHAIN_FILE=toolchain.cmake

# 目标系统处理器
set(CMAKE_SYSTEM_PROCESSOR arm)

# 查找程序（禁用系统路径）
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
```

### 常用选项

```shell
# 首次配置
cmake -S . -B build
cmake -B build -DCMAKE_BUILD_TYPE=Release

# 构建
cmake --build build
cmake --build build --target myapp
cmake --build build -- -j4                    # 并行构建

# 清理构建
rm -rf build
cmake --build build -- clean

# 重新配置
cmake -B build

# 显示所有变量
cmake -LA . | grep VAR

# 设置变量
cmake -B build -DVAR=value

# 安装
cmake --install build
cmake --install build --prefix /usr/local

# 预设
cmake --preset list
cmake --preset default
cmake --build --preset default
```

### presets

```json
// CMakePresets.json
{
    "version": 4,
    "configurePresets": [
        {
            "name": "default",
            "binaryDir": "${sourceDir}/build",
            "cacheVariables": {
                "CMAKE_BUILD_TYPE": "Release",
                "ENABLE_TESTS": "ON"
            }
        },
        {
            "name": "debug",
            "inherits": "default",
            "cacheVariables": {
                "CMAKE_BUILD_TYPE": "Debug"
            }
        }
    ]
}
```

### FetchContent（依赖）

```cmake
include(FetchContent)

FetchContent_Declare(
    googletest
    GIT_REPOSITORY https://github.com/google/googletest.git
    GIT_TAG v1.12.1
)

FetchContent_MakeAvailable(googletest)
```
