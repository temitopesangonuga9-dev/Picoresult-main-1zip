import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  CheckSquare, 
  Clock, 
  BarChart2, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search, 
  Plus, 
  Calendar,
  UserCheck
} from 'lucide-react';

// Subcomponents for different views
const DashboardView = () => (
  <div className="space-y-6">
    {/* Welcome Section */}
    <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white shadow-md">
      <h1 className="text-2xl font-bold mb-2">Welcome Back, Professor!</h1>
      <p className="text-green-500 text-sm">Here's what's happening with your classes and exams today.</p>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { title: 'Active Exams', value: '3', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Total Students', value: '142', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Pending Reviews', value: '28', icon: CheckSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
        { title: 'Avg. Performance', value: '78%', icon: BarChart2, color: 'text-purple-600', bg: 'bg-purple-50' },
      ].map((stat, idx) => (
        <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{stat.title}</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
          </div>
          <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
            <stat.icon size={22} />
          </div>
        </div>
      ))}
    </div>

    {/* Recent Activity & Quick Actions */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm lg:col-span-2">
        <h3 className="text-gray-800 font-bold text-md mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-green-600" /> Upcoming Exam Sessions
        </h3>
        <div className="space-y-3">
          {[
            { name: 'Data Structures Midterm', code: 'CS-201', time: 'Today, 2:00 PM', duration: '90 mins' },
            { name: 'Database Management Quiz 3', code: 'CS-302', time: 'Tomorrow, 10:00 AM', duration: '45 mins' },
            { name: 'Software Engineering Final', code: 'CS-401', time: 'Oct 15, 9:00 AM', duration: '180 mins' },
          ].map((exam, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100/70 transition">
              <div>
                <h4 className="font-semibold text-sm text-gray-800">{exam.name}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{exam.code} • {exam.duration}</p>
              </div>
              <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                {exam.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-gray-800 font-bold text-md mb-4">Quick Shortcuts</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-3 border border-gray-100 rounded-lg text-left text-sm font-medium text-gray-700 hover:bg-green-50/50 hover:text-green-700 hover:border-green-100 transition">
            Create New Exam <Plus size={16} />
          </button>
          <button className="w-full flex items-center justify-between p-3 border border-gray-100 rounded-lg text-left text-sm font-medium text-gray-700 hover:bg-green-50/50 hover:text-green-700 hover:border-green-100 transition">
            View Gradebook <BarChart2 size={16} />
          </button>
          <button className="w-full flex items-center justify-between p-3 border border-gray-100 rounded-lg text-left text-sm font-medium text-gray-700 hover:bg-green-50/50 hover:text-green-700 hover:border-green-100 transition">
            Student Manifest <Users size={16} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ExamsView = () => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Exam Management</h2>
        <p className="text-xs text-gray-400 mt-0.5">Build, deploy, and analyze your digital examinations</p>
      </div>
      <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition">
        <Plus size={16} /> Create Exam
      </button>
    </div>
    <div className="border border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-400 text-sm">
      <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
      No modern examinations found. Click "Create Exam" to initialize your first test module.
    </div>
  </div>
);

const StudentsView = () => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
    <h2 className="text-xl font-bold text-gray-800 mb-1">Assigned Students</h2>
    <p className="text-xs text-gray-400 mb-6">Manage rosters and individual profile statuses across your courses</p>
    <div className="border border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-400 text-sm">
      <Users size={40} className="mx-auto mb-3 text-gray-300" />
      Your student database is fully synced with active registrar courses.
    </div>
  </div>
);

// ✅ Added Subcomponent for the Enrollment tab
const EnrollmentView = () => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Course Enrollment Portal</h2>
        <p className="text-xs text-gray-400 mt-0.5">Approve registration handles and process new entry manifest lines</p>
      </div>
      <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition">
        <Plus size={16} /> Bulk Upload Manifest
      </button>
    </div>
    <div className="border border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-400 text-sm">
      <UserCheck size={40} className="mx-auto mb-3 text-gray-300" />
      Enrollment modules are operational. Ready to accept student exam registration keys.
    </div>
  </div>
);

export default function TeacherPortal() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Sidebar navigation mapping
  const navItems = [
    { name: 'Dashboard', icon: BookOpen },
    { name: 'Exams', icon: GraduationCap },
    { name: 'Students', icon: Users },
    { name: 'Create Enrollment', icon: UserCheck }, // Target component link
    { name: 'Reports', icon: BarChart2 },
    { name: 'Settings', icon: Settings },
  ];

  // ✅ Fixed rendering dispatcher logic block 
  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardView />;
      case 'Exams':
        return <ExamsView />;
      case 'Students':
        return <StudentsView />;
      case 'Create Enrollment': // Catch active selection state properly
        return <EnrollmentView />;
      default:
        return (
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center text-gray-400">
            Content wrapper for "{activeTab}" view layer is currently processing.
          </div>
        );
    }
  };

  return (
    <div className="min-height-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 bg-gray-900 text-gray-300 w-64 z-50 transform transition-transform duration-200 ease-in-out border-r border-gray-800
        lg:translate-x-0 lg:static lg:h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <GraduationCap size={24} className="text-green-500" />
            <span className="text-white font-bold text-lg tracking-wide">ExamPortal</span>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User context badge */}
        <div className="p-4 border-b border-gray-800/60 bg-gray-950/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">
            PR
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white leading-tight">Prof. Roberts</h4>
            <span className="text-[11px] text-gray-500 font-medium tracking-wide uppercase">Faculty Admin</span>
          </div>
        </div>

        {/* Navigation Elements */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition duration-150 group
                  ${isActive 
                    ? 'bg-green-600 text-white font-semibold' 
                    : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                  }
                `}
              >
                <item.icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'} />
                {item.name}
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-gray-800">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-950/30 hover:text-red-400 transition duration-150">
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Layout Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top bar header context */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="p-2 -ml-2 text-gray-500 hover:text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-64">
              <Search size={16} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search metrics or rosters..." 
                className="bg-transparent border-none text-xs text-gray-700 focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 relative transition">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-xs font-semibold text-gray-700">Term: Fall 2026</span>
            </div>
          </div>
        </header>

        {/* Inner Content Render Box */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
