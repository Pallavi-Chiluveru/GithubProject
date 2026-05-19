import React, { useState, useEffect } from 'react';
import API from '../api';
import { motion, AnimatePresence } from 'framer-motion';

const ContributionHeatmap = ({ username }) => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDate, setHoveredDate] = useState(null);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const res = await API.get(`/activity-api/contributions/${username}`);
        setContributions(res.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching contributions:', err);
        setLoading(false);
      }
    };
    fetchContributions();
  }, [username]);

  // Generate a grid for the last 12 months (roughly 52 weeks)
  const generateGrid = () => {
    const days = [];
    const today = new Date();
    const startDate = new Date();
    startDate.setFullYear(today.getFullYear() - 1);
    
    // Adjust to the nearest previous Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());

    for (let i = 0; i < 365 + 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const contribution = contributions.find(c => c._id === dateStr);
      const count = contribution ? contribution.count : 0;
      
      days.push({
        date: dateStr,
        count,
        intensity: count === 0 ? 0 : count <= 3 ? 1 : count <= 6 ? 2 : count <= 10 ? 3 : 4
      });
    }
    return days;
  };

  const days = generateGrid();
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekDays = ['Mon', 'Wed', 'Fri'];

  const getIntensityClass = (level) => {
    switch (level) {
      case 0: return 'bg-[#161b22] border-[#1b1f230f]';
      case 1: return 'bg-[#0e4429] border-[#1b1f230f]';
      case 2: return 'bg-[#006d32] border-[#1b1f230f]';
      case 3: return 'bg-[#26a641] border-[#1b1f230f]';
      case 4: return 'bg-[#39d353] border-[#1b1f230f]';
      default: return 'bg-[#161b22]';
    }
  };

  if (loading) {
    return <div className="h-40 bg-[#161b22] border border-[#30363d] rounded-md animate-pulse"></div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-white">
        {contributions.reduce((acc, curr) => acc + curr.count, 0)} contributions in the last year
      </h3>

      <div className="relative border border-[#30363d] rounded-md p-4 bg-[#0d1117] overflow-x-auto custom-scrollbar">
        <div className="flex gap-2">
          {/* Weekday Labels */}
          <div className="flex flex-col justify-between text-[9px] text-[#8b949e] py-4 pr-1">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          <div className="flex-1">
            {/* Month Labels */}
            <div className="flex justify-between text-[10px] text-[#8b949e] mb-2 px-1">
               {/* Simplified month display */}
               {months.map(m => <span key={m}>{m}</span>)}
            </div>

            <div className="flex gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      className={`w-3 h-3 rounded-[2px] transition-all cursor-pointer border ${getIntensityClass(day.intensity)}`}
                      onMouseEnter={() => setHoveredDate(day)}
                      onMouseLeave={() => setHoveredDate(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-between text-[10px] text-[#8b949e]">
          <a href="#" className="hover:text-[#2f81f7]">Learn how we count contributions</a>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map(l => (
              <div key={l} className={`w-2.5 h-2.5 rounded-[2px] border ${getIntensityClass(l)}`}></div>
            ))}
            <span>More</span>
          </div>
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredDate && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute bg-[#161b22] border border-[#30363d] rounded px-3 py-1.5 shadow-2xl z-50 pointer-events-none text-xs"
              style={{
                left: '50%',
                top: '-40px',
                transform: 'translateX(-50%)'
              }}
            >
              <span className="font-bold text-white">{hoveredDate.count} contributions</span>
              <span className="text-[#8b949e] ml-2">on {new Date(hoveredDate.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContributionHeatmap;
