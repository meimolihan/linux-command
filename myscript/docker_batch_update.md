docker_batch_update
===

一键批量扫描并更新指定目录下所有 Docker Compose 项目，自动拉取镜像、重建容器、清理无用镜像，实时显示容器状态并输出完整更新统计报告。

## 一键脚本

- 配合 `1panel` 定时更新 compose 项目完美。

```bash
bash <(curl -sL gitee.com/meimolihan/linux-command_sh/raw/master/docker_batch_update.sh) /vol1/1000/compose
```

## 效果预览

![执行脚本效果预览](https://file.meimolihan.eu.org/screenshot/docker_batch_update.webp "截图演示")

## 补充说明

该脚本用于一键批量扫描并更新指定目录下所有 Docker Compose 项目，基于 docker-compose/docker compose 命令实现，适合配合 1Panel 等面板进行定时更新。

### 功能特点

* 自动化批量更新：递归扫描并拉取最新镜像、重建容器
* 智能项目识别：支持 docker-compose.yml、docker-compose.yaml、compose.yml 三种文件名
* 项目名称提取：优先从 compose 文件、.env 文件中提取项目名
* 更新类型检测：区分镜像更新、容器更新、镜像+容器更新、无变化等情况
* 自动清理镜像：更新后执行 docker image prune 清理无用镜像
* 容器状态显示：更新后展示每个项目的容器运行状态
* 详细统计报告：显示总计、成功、失败、有更新、无更新的项目数量和列表
* 耗时统计：记录整个更新过程的开始和结束时间

### 输出说明

脚本输出包含以下字段：

| 字段 | 说明 |
| --- | --- |
| 开始更新时间 | 显示更新开始的时间戳 |
| 处理进度 | 显示当前处理的目录编号、路径和项目名称 |
| 镜像拉取 | 显示 pull 命令的执行结果和退出码 |
| 容器更新 | 显示 up 命令的执行结果和更新类型 |
| 容器状态 | 更新后的容器数量和运行状态（运行中/已停止） |
| 镜像清理 | 显示无用镜像清理结果 |
| 统计信息 | 总计项目数、成功数、失败数 |
| 有更新的项目 | 列出实际有更新的项目名称和更新类型 |
| 无更新的项目 | 列出无变化的项目名称 |
| 结束更新时间 | 显示更新结束的时间戳 |
| 更新用时 | 显示整个更新过程的总耗时（时:分:秒） |

### 注意事项

* 脚本需要 Docker 和 docker-compose/docker compose 命令可用
* 更新操作会重新创建容器，但保留数据卷
* 默认递归扫描最大深度为 3 级目录
* 脚本会自动检测并使用可用的 compose 命令（优先 docker-compose，备用 docker compose）
* 更新失败的项目会显示错误输出（最多5行）
* 建议更新后检查容器健康状态，确保服务正常运行
* 适合配置为定时任务（如配合 1Panel 的定时任务功能）
* 如果项目名包含特殊字符，项目名称提取可能不准确

## 脚本源码

- 传参：`./脚本名.sh /自定义目录`
- 不传参：`./脚本名.sh "当前目录" `

```bash
#!/bin/bash
set -uo pipefail

gl_hui='\e[37m'
gl_hong='\033[31m'
gl_lv='\033[32m'
gl_huang='\033[33m'
gl_lan='\033[34m'
gl_bai='\033[97m'
gl_zi='\033[35m'
gl_bufan='\033[96m'
gl_info='\033[94m'
gl_reset='\033[0m'

TARGET_DIR="${1:-.}"
COMPOSE_CMD=$(command -v docker-compose || echo "docker compose")
COUNT=0
SUCCESS=0
FAIL=0
UPDATED_PROJECTS=()  
NO_UPDATE_PROJECTS=()

display_container_status() {
    local container_count=0
    local running_count=0
    
    $COMPOSE_CMD ps --format "table {{.Name}}\t{{.State}}\t{{.Ports}}" 2>/dev/null | while IFS= read -r line; do
        if [[ "$line" =~ "NAME" ]] || [[ "$line" =~ "----" ]] || [[ "$line" =~ "PORTS" ]] || \
           [[ "$line" =~ "COMMAND" ]] || [[ -z "$line" ]] || [[ "$line" =~ "^-+" ]]; then
            continue
        fi
        
        local container_name=$(echo "$line" | awk '{print $1}')
        local container_state=$(echo "$line" | awk '{print $2}')
        
        if [[ -n "$container_name" ]] && [[ -n "$container_state" ]] && \
           [[ "$container_name" =~ ^[a-zA-Z0-9][a-zA-Z0-9_.-]+$ ]] && \
           [[ "$container_state" =~ ^(Up|Exited|Restarting|Paused|Dead|Created|Stopped)$ ]]; then
            
            ((container_count++))
            
            case "$container_state" in
                "Up")
                    ((running_count++))
                    ;;
            esac
        fi
    done
    
    if [[ $container_count -eq 0 ]]; then
        local containers=$($COMPOSE_CMD ps -q 2>/dev/null)
        if [[ -n "$containers" ]]; then
            container_count=$(echo "$containers" | wc -l)
            running_count=$($COMPOSE_CMD ps --filter status=running -q 2>/dev/null | wc -l)
        fi
    fi
    
    if [[ $container_count -gt 0 ]]; then
        echo -e "${gl_bai}容器状态: ${gl_lv}✓${gl_bai} 发现 ${gl_bufan}$container_count ${gl_bai}个容器，其中 ${gl_bufan}$running_count ${gl_bai}个在运行"
    else
        echo -e "${gl_bai}容器状态: ${gl_huang}⚠️ 未发现运行中的容器${gl_bai}"
    fi
}

check_for_updates() {
    local dir="$1"
    local project_name="$2"
    local pull_exit_code="$3"
    local up_exit_code="$4"
    local pull_output="$5"
    local up_output="$6"
    
    local has_update=false
    local update_type=""
    
    if [[ $pull_exit_code -eq 0 ]]; then
        if echo "$pull_output" | grep -q -E "Downloaded newer image|Status: Downloaded newer image"; then
            has_update=true
            update_type="镜像更新"
        fi
    fi
    
    if [[ $up_exit_code -eq 0 ]]; then
        if echo "$up_output" | grep -q -E "Recreating|Creating|Starting|Started"; then
            has_update=true
            if [[ -n "$update_type" ]]; then
                update_type="镜像+容器更新"
            else
                update_type="容器更新"
            fi
        fi
    fi
    
    if [[ "$has_update" == "true" ]]; then
        UPDATED_PROJECTS+=("$project_name")
        echo -e "${gl_lv}✅ 更新成功 ${gl_huang}(${update_type})${gl_bai}"
    else
        NO_UPDATE_PROJECTS+=("$project_name")
        echo -e "${gl_lv}✅  更新完成 (无变化)${gl_bai}"
    fi
}

echo -e ""
start_time=$(date '+%F %T'); start_ts=$(date +%s)
echo -e "${gl_bai}开始更新时间：${gl_lv}$start_time${gl_bai}"
echo -e "${gl_bai}开始更新 ${gl_huang}$TARGET_DIR${gl_bai} 下的所有 Docker Compose 项目${gl_hong}.${gl_huang}.${gl_lv}.${gl_reset}"
echo -e "${gl_bufan}————————————————————————————————————————————————${gl_reset}"

while IFS= read -r dir; do
    [[ -z "$dir" ]] && continue
    ((COUNT++))

    echo -e ""
    echo -e "${gl_bai}[${gl_bufan}$COUNT${gl_bai}]${gl_zi} >>> 处理目录: ${gl_huang}$dir${gl_bai}"
    # echo -e "${gl_bai}[${gl_bufan}$COUNT${gl_bai}]${gl_zi} >>> 处理目录: ${gl_huang}$(basename "$dir")${gl_bai}"
    # echo -e "${gl_bai}项目路径: ${gl_huang}$dir${gl_bai}"

    if cd "$dir" 2>/dev/null; then
        DIR_NAME=$(basename "$dir")
        PROJECT_NAME="$DIR_NAME"
        
        if grep -q "^name:" docker-compose.yml docker-compose.yaml compose.yml 2>/dev/null; then
            COMPOSE_FILE=$(ls docker-compose.yml docker-compose.yaml compose.yml 2>/dev/null | head -1)
            if [[ -n "$COMPOSE_FILE" ]]; then
                COMPOSE_NAME=$(grep "^name:" "$COMPOSE_FILE" | head -1 | sed 's/^name:[[:space:]]*//' | tr -d '\r'"'"'"')
                [[ -n "$COMPOSE_NAME" ]] && PROJECT_NAME="$COMPOSE_NAME"
            fi
        fi
        
        if [[ -f ".env" ]] && grep -q "COMPOSE_PROJECT_NAME" .env; then
            ENV_NAME=$(grep "COMPOSE_PROJECT_NAME" .env | head -1 | cut -d'=' -f2- | tr -d '\r'"'"'"')
            [[ -n "$ENV_NAME" ]] && PROJECT_NAME="$ENV_NAME"
        fi
        
        echo -e "${gl_bai}项目名称: ${gl_huang}$PROJECT_NAME${gl_bai}"

        echo -e "${gl_bai}正在拉取镜像中${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
        PULL_OUTPUT=$($COMPOSE_CMD pull --quiet 2>&1)
        PULL_EXIT_CODE=$?
        
        echo -e "${gl_bai}正在更新容器中${gl_hong}.${gl_huang}.${gl_lv}.${gl_bai}"
        UP_OUTPUT=$($COMPOSE_CMD up -d --remove-orphans 2>&1)
        UP_EXIT_CODE=$?
        
        check_for_updates "$dir" "$PROJECT_NAME" "$PULL_EXIT_CODE" "$UP_EXIT_CODE" "$PULL_OUTPUT" "$UP_OUTPUT"
        
        if [[ $PULL_EXIT_CODE -eq 0 ]] && [[ $UP_EXIT_CODE -eq 0 ]]; then
            display_container_status
            docker image prune -f >/dev/null 2>&1 && echo -e "${gl_bai}镜像清理: ${gl_lv}♻️  镜像清理完成${gl_bai}"
            ((SUCCESS++))
        else
            echo -e "${gl_hong}❌ 更新失败${gl_bai}"
            [[ $PULL_EXIT_CODE -ne 0 ]] && echo -e "${gl_huang}Pull错误: ${gl_hui}$(echo "$PULL_OUTPUT" | head -5)${gl_bai}"
            [[ $UP_EXIT_CODE -ne 0 ]] && echo -e "${gl_huang}Up错误: ${gl_hui}$(echo "$UP_OUTPUT" | head -5)${gl_bai}"
            ((FAIL++))
        fi
    else
        echo -e "${gl_huang}⚠️  无法进入目录${gl_bai}"
        ((FAIL++))
    fi
done < <(find "$TARGET_DIR" -maxdepth 3 \( -name "docker-compose.yml" -o -name "docker-compose.yaml" -o -name "compose.yml" \) 2>/dev/null | xargs dirname 2>/dev/null | sort -u)

# 显示统计结果（保持不变）
echo ""
echo -e "${gl_lv}✅ 批量更新完成！"
echo -e "${gl_bufan}————————————————————————————————————————————————${gl_reset}"
echo -e "  ${gl_bai}统计信息${gl_bai}"
echo -e "    ${gl_bai}总计项目: ${gl_huang}$COUNT${gl_bai}"
echo -e "    ${gl_bai}总计成功: ${gl_lv}$SUCCESS${gl_bai}"
echo -e "    ${gl_bai}总计失败: ${gl_hong}$FAIL${gl_bai}"

if [[ ${#UPDATED_PROJECTS[@]} -gt 0 ]]; then
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_reset}"
    echo -e "  ${gl_bai}有实际更新的项目 (${gl_lv}${#UPDATED_PROJECTS[@]}${gl_bai}个):"
    for i in "${!UPDATED_PROJECTS[@]}"; do
        project_name="${UPDATED_PROJECTS[$i]}"
        [[ -n "$project_name" ]] && [[ "$project_name" != "unknown_project" ]] && \
        echo -e "    ${gl_lv}✓${gl_bai} $((i+1)). $project_name"
    done
else
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_reset}"
    echo -e "  ${gl_hui}无项目更新${gl_bai}"
fi

if [[ ${#NO_UPDATE_PROJECTS[@]} -gt 0 ]]; then
    echo -e "${gl_bufan}————————————————————————————————————————————————${gl_reset}"
    echo -e "  ${gl_bai}无更新的项目 (${gl_bufan}${#NO_UPDATE_PROJECTS[@]}${gl_bai}个):"
    for i in "${!NO_UPDATE_PROJECTS[@]}"; do
        project_name="${NO_UPDATE_PROJECTS[$i]}"
        [[ -n "$project_name" ]] && [[ "$project_name" != "unknown_project" ]] && \
        echo -e "    ${gl_lv}○${gl_bai} $((i+1)). $project_name"
    done
fi

echo -e "${gl_bufan}————————————————————————————————————————————————${gl_reset}"
end_time=$(date '+%F %T'); end_ts=$(date +%s)
total=$((end_ts - start_ts))
printf -v dur "%d时%02d分%02d秒" $((total/3600)) $(((total%3600)/60)) $((total%60))
echo -e "${gl_bai}结束更新时间：${gl_hong}$end_time${gl_bai}"
echo -e "${gl_bai}更新用时共计：${gl_lv}$dur${gl_bai}"
echo -e "${gl_bufan}————————————————————————————————————————————————${gl_reset}"

if [[ ${#UPDATED_PROJECTS[@]} -gt 0 ]]; then
    echo -e "${gl_zi}💡 提示: 有 ${gl_lv}${#UPDATED_PROJECTS[@]}${gl_zi} 个项目已更新，建议进行健康检查${gl_bai}"
fi

if [[ $FAIL -gt 0 ]]; then
    echo -e "${gl_huang}⚠️  注意: 有 ${gl_hong}$FAIL${gl_huang} 个项目更新失败，请检查日志${gl_bai}"
fi
```


## 创建本地脚本

```bash
new_script="new_test.sh"

cat > "$new_script" << 'EOF'
#!/bin/bash

# 粘贴脚本源码

EOF

# 保留本地脚本，去掉 rm -f "$new_script"
chmod +x "$new_script" && ./"$new_script" && rm -f "$new_script"
```
