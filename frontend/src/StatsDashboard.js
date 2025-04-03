import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from "recharts";

const StatsDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((error) => console.error(error));
  }, []);

  if (!stats) return <p>Chargement des statistiques...</p>;

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const taskData = [
    { name: "Tâches Terminées", value: stats.completedTasks },
    { name: "Tâches En Cours", value: stats.pendingTasks }
  ];

  const taskByUserData = stats.taskByUser.map((userStat) => ({
    name: userStat._id || "Non assigné",
    Tâches: userStat.count
  }));

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Statistiques des Tâches</h2>

      <PieChart width={400} height={400}>
        <Pie data={taskData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value">
          {taskData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>

      <BarChart width={600} height={300} data={taskByUserData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Tâches" fill="#82ca9d" />
      </BarChart>
    </div>
  );
};

export default StatsDashboard;
