# Sociograph Metrics & Calculation Logic

This document provides a detailed breakdown of the Social Network Analysis (SNA) metrics used in the application. All calculations are performed in real-time as you modify the network.

## 1. Node-Level Centrality Metrics

These metrics evaluate the importance of individual actors within the network.

### Degree Centrality
Measures how many direct connections a node has.
- **In-Degree**: The number of incoming dependencies. Normalized as `raw_in / (n - 1)`.
- **Out-Degree**: The number of outgoing dependencies. Normalized as `raw_out / (n - 1)`.
- **Total Degree**: The sum of all incoming and outgoing ties. Normalized as `raw_total / (n - 1)`.
- **Interpretation**: High degree nodes are the "hubs" of the network with direct influence or visibility.

### Betweenness Centrality
Measures how often a node lies on the shortest path between other nodes.
- **Algorithm**: Implemented using **Brandes' Algorithm**, which calculates the ratio of shortest paths between pairs $s$ and $t$ that pass through node $v$.
- **Normalization**: For a directed graph with $n$ nodes, the raw score is divided by $(n - 1)(n - 2)$.
- **Interpretation**: High betweenness nodes are "gatekeepers" or "bridges" that control the flow of information or resources between different clusters.

### Closeness Centrality
Measures how "close" a node is to all other nodes in the network.
- **Calculation**: The inverse of the average shortest path distance from the node to all other reachable nodes.
- **Normalization**: Uses the **Wasserman and Faust** adjustment for disconnected networks:
  `Closeness = (reachable_count / (n - 1)) * (reachable_count / sum_of_distances)`
- **Interpretation**: High closeness nodes can spread information or reach others most efficiently (independence from intermediaries).

### Impact Score (Composite)
A custom weighted metric designed to highlight overall structural importance.
- **Formula**: `(Betweenness * 0.7) + (Closeness * 0.3)`
- **Interpretation**: Prioritizes "bridging" potential (betweenness) while factoring in reachability (closeness).

---

## 2. Network-Level Metrics

These metrics evaluate the structure of the entire sociogram.

### Network Density
The ratio of actual connections to the total potential connections.
- **Formula**: `Total_Edges / (n * (n - 1))`
- **Scale**: 0 to 1 (where 1 is a "complete graph").
- **Interpretation**: High density indicates a highly cohesive and interconnected network.

### Avg Degree
The average number of total connections (in + out) per actor.
- **Formula**: `Sum(Total_Degrees) / n`

### Flow Efficiency (Avg Closeness)
The average Closeness Centrality across all nodes.
- **Interpretation**: Indicates how quickly information or influence can permeate the entire network on average.

---

## Technical Implementation Details
- **Normalization**: All centrality metrics are normalized between 0 and 1 to allow for comparison across networks of different sizes.
- **Directional Sensitivity**: The calculations account for directed edges vs. bidirectional relationships.
- **Real-time Sync**: Metrics are re-calculated on every state change using the `calculateSNAMetrics` utility in `src/lib/sna.ts`.

---

## 3. Export Capabilities

The application supports multiple export formats to facilitate further analysis and reporting:

### Project Data (JSON)
- **Content**: Full state including all actors, categories, relationship types, and current connection strengths.
- **Use Case**: Backing up the project for later import or programmatic processing with external tools.

### Vector Map (SVG)
- **Content**: A high-quality vector graphic of the current network map.
- **Use Case**: Inclusion in reports, presentations, or static documentation.

### Nodes & SNA Metrics (CSV)
- **Content**: Detailed node list with all calculated centrality scores (In-Degree, Out-Degree, Betweenness, Closeness, Impact) and an adjacency list (Incoming, Outgoing, and All neighbors).
- **Use Case**: Deep statistical analysis in Excel, R, or Python.

### Connections List (CSV)
- **Content**: A flat list of every edge in the network, including source, target, type, strength, and bidirectional status.
- **Use Case**: Relationship mapping and audit trails.

### Network Summary (CSV)
- **Content**: Global network constants (Density, Avg Degree, Flow Efficiency).
- **Use Case**: Quick executive summary of network cohesion and efficiency.
