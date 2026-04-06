import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workspaceService } from '@/lib/workspaceApi';
import { promptService } from '@/lib/api';
import BackButton from '@/components/BackButton';
import toast from 'react-hot-toast';
import { Trash2, Edit, Save, X, Clock, Users, FileText } from 'lucide-react';

interface Member {
    id: string;
    userId: string;
    role: string;
    email: string;
    name?: string;
}

interface Workspace {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
}

interface Activity {
    id: string;
    type: string;
    user: string;
    action: string;
    timestamp: string;
    resourceType?: string;
    resourceName?: string;
}

export default function WorkspaceSettings() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [members, setMembers] = useState<Member[]>([]);
    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState('viewer');
    const [editingName, setEditingName] = useState(false);
    const [editingDescription, setEditingDescription] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            // Load members
            const membersData = await workspaceService.getMembers(id!);
            setMembers(membersData);
            
            // Load workspace info
            const workspaces = await workspaceService.getAll();
            const currentWorkspace = workspaces.find((ws: Workspace) => ws.id === id);
            if (currentWorkspace) {
                setWorkspace(currentWorkspace);
                setNewName(currentWorkspace.name);
                setNewDescription(currentWorkspace.description || '');
            }
            
            // Load activity logs
            try {
                const activityData = await promptService.getWorkspaceActivity(id!);
                setActivities(activityData);
            } catch (error) {
                console.error('Failed to load activity logs', error);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load workspace data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail) return;
        try {
            await workspaceService.addMember(id!, newEmail, newRole);
            toast.success('Member added');
            setNewEmail('');
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to add member');
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await workspaceService.removeMember(id!, userId);
            toast.success('Member removed');
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to remove member');
        }
    };

    const handleUpdateWorkspace = async () => {
        if (!workspace) return;
        try {
            await promptService.updateWorkspace(id!, {
                name: newName,
                description: newDescription
            });
            toast.success('Workspace updated');
            setEditingName(false);
            setEditingDescription(false);
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update workspace');
        }
    };

    const handleDeleteWorkspace = async () => {
        if (!confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) return;
        try {
            await promptService.deleteWorkspace(id!);
            toast.success('Workspace deleted');
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete workspace');
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-[1200px]">
                <BackButton to="/" label="Back to Dashboard" />
                
                <h1 className="text-2xl font-bold mt-4 mb-6">Workspace Settings</h1>
                
                {/* Workspace Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-bold mb-4">Workspace Information</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <label className="w-24 text-sm font-medium text-gray-600">Name</label>
                            {editingName ? (
                                <div className="flex gap-2 flex-1">
                                    <input 
                                        type="text" 
                                        className="flex-1 border rounded px-3 py-2"
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                    />
                                    <button 
                                        onClick={handleUpdateWorkspace}
                                        className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
                                    >
                                        <Save className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setEditingName(false);
                                            setNewName(workspace?.name || '');
                                        }}
                                        className="bg-gray-200 text-gray-600 p-2 rounded hover:bg-gray-300"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 flex-1">
                                    <span className="font-medium">{workspace?.name}</span>
                                    <button 
                                        onClick={() => setEditingName(true)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex items-start gap-3">
                            <label className="w-24 text-sm font-medium text-gray-600 pt-2">Description</label>
                            {editingDescription ? (
                                <div className="flex gap-2 flex-1">
                                    <textarea 
                                        className="flex-1 border rounded px-3 py-2"
                                        value={newDescription}
                                        onChange={e => setNewDescription(e.target.value)}
                                        rows={3}
                                    />
                                    <div className="flex flex-col gap-2">
                                        <button 
                                            onClick={handleUpdateWorkspace}
                                            className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
                                        >
                                            <Save className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setEditingDescription(false);
                                                setNewDescription(workspace?.description || '');
                                            }}
                                            className="bg-gray-200 text-gray-600 p-2 rounded hover:bg-gray-300"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-2 flex-1">
                                    <span className="text-gray-600">{workspace?.description || 'No description'}</span>
                                    <button 
                                        onClick={() => setEditingDescription(true)}
                                        className="text-blue-600 hover:text-blue-800 mt-1"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="w-24 text-sm font-medium text-gray-600">Created</label>
                            <span className="text-gray-600">{workspace ? new Date(workspace.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="w-24 text-sm font-medium text-gray-600">Members</label>
                            <span className="text-gray-600">{members.length}</span>
                        </div>
                    </div>
                </div>
                
                {/* Invite Member */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-bold mb-4">Invite Member</h2>
                    <form onSubmit={handleAddMember} className="flex gap-4">
                        <input 
                            type="email" 
                            placeholder="Email address" 
                            className="flex-1 border rounded px-3 py-2"
                            value={newEmail}
                            onChange={e => setNewEmail(e.target.value)}
                            required
                        />
                        <select 
                            className="border rounded px-3 py-2 bg-white"
                            value={newRole}
                            onChange={e => setNewRole(e.target.value)}
                        >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                            <option value="owner">Owner</option>
                        </select>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Invite
                        </button>
                    </form>
                </div>

                {/* Members */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b bg-gray-50 font-bold text-gray-700 flex justify-between items-center">
                        <span>Members ({members.length})</span>
                        <Users className="w-5 h-5 text-gray-500" />
                    </div>
                    <table className="w-full">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-3 text-left">Name</th>
                                <th className="px-6 py-3 text-left">Email</th>
                                <th className="px-6 py-3 text-left">Role</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {members.map(member => (
                                <tr key={member.id}>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {member.name || member.email.split('@')[0]}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {member.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${member.role === 'owner' ? 'bg-purple-100 text-purple-800' : 
                                              member.role === 'editor' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {member.role !== 'owner' && (
                                            <button 
                                                onClick={() => handleRemoveMember(member.userId)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Activity Logs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b bg-gray-50 font-bold text-gray-700 flex justify-between items-center">
                        <span>Recent Activity</span>
                        <Clock className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="p-6">
                        {activities.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                No recent activity
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activities.map(activity => (
                                    <div key={activity.id} className="flex gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            {activity.type === 'member' && <Users className="w-4 h-4 text-blue-600" />}
                                            {activity.type === 'prompt' && <FileText className="w-4 h-4 text-blue-600" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-800">
                                                {activity.user} {activity.action}
                                                {activity.resourceName && ` ${activity.resourceType}: ${activity.resourceName}`}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {new Date(activity.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold mb-4 text-red-600">Danger Zone</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        These actions cannot be undone. Proceed with caution.
                    </p>
                    <button 
                        onClick={handleDeleteWorkspace}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Delete Workspace
                    </button>
                </div>
            </div>
        </div>
    );
}
