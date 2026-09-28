import json
from datetime import date

src = json.load(open('notes/knowledge-graph.json'))

# --- nodes: 全部条目，字段直接取自源文件，不发明 ---
nodes = []
for e in src['entries']:
    nodes.append({
        "id": e["id"],
        "label": f"{e['实体']} / {e['英文']}",
        "type": e["类型"],
        "status": e["状态"],
    })

# --- edges: 只编码源文件中已存在的"区别于"关系，不推断新关系 ---
edges = []
skipped = []
for e in src['entries']:
    assoc = (e.get("关联") or "").strip()
    if not assoc.startswith("区别于"):
        skipped.append({
            "id": e["id"],
            "实体": e["实体"],
            "关联原文": assoc,
            "原因": "非'区别于'型关系，按规则未生成边",
        })
        continue
    rest = assoc[len("区别于"):].strip()
    parts = rest.split("；", 1)
    target = parts[0].strip()
    # 只在首尾为成对引号时才剥离，避免破坏原文内部的引号
    if len(target) >= 2 and target[0] in '“”"\'‘’' and target[-1] in '“”"\'‘’':
        target = target[1:-1]
    note = parts[1].strip() if len(parts) > 1 else ""
    edge = {
        "source": e["id"],
        "relation": "区别于",
        "target_literal": target,
        "label": f"{e['实体']} 区别于 {target}",
    }
    if note:
        edge["note"] = note
    edges.append(edge)

derived = {
    "name": "神学翻译注释知识图谱（派生导出视图）",
    "generated": True,
    "is_source_of_truth": False,
    "source_of_truth": "notes/knowledge-graph.json",
    "derived_from": "notes/knowledge-graph.json",
    "derived_from_version": src.get("version"),
    "generated_at": str(date.today()),
    "derivation_rules": [
        "本文件由脚本从 notes/knowledge-graph.json 机械生成，未手工编辑；不要手工改它，要改请改源文件后重新生成。",
        "nodes：源文件全部条目收录，id / label / type / status 直接取自源文件的 id、实体+英文、类型、状态。",
        "edges：只编码源文件中已经存在的'区别于'关系；没有推断任何新关系。",
        "没有新增 contrasts_with / depends_on / supports / causes 等关系类型；relation 字段统一为源数据原有的'区别于'。",
        "边的目标为字面文本（target_literal），不是图谱内节点引用——源数据的关联目标本就不是节点 ID，不虚构节点。",
        "未来若定义了新的真实概念关系，再单独升级 schema 并重新生成本文件。",
    ],
    "relation_types": ["区别于"],
    "skipped_entries": skipped,
    "nodes": nodes,
    "edges": edges,
}

with open('notes/knowledge-graph.derived.json', 'w') as f:
    json.dump(derived, f, ensure_ascii=False, indent=2)
    f.write("\n")

print(f"nodes: {len(nodes)}, edges: {len(edges)}, skipped: {len(skipped)}")
for s in skipped:
    print("  skipped:", s["id"], "-", s["原因"])
