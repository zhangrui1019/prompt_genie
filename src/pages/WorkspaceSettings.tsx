import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workspaceService } from '@/lib/workspaceApi';
import BackButton from '@/components/BackButton';
import toast from 'react-hot-toast';
import { TrashIcon } from '@heroicons/react/20/solid';

interface Member {
    id: string;
    userId: string;
    role: string;
    email?: string; // Ideally backend should return user details
}

export default function WorkspaceSettings() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [members, setMembers] = useState<Member[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState('viewer');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadMembers();
        }
    }, [id]);

    const loadMembers = async () => {
        try {
            const data = await workspaceService.getMembers(id!);
            setMembers(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load members');
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
            loadMembers();
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
            loadMembers();
        } catch (error) {
            console.error(error);
            toast.error('Failed to remove member');
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-[1000px]">
                <BackButton to="/" label="Back to Dashboard" />
                
                <h1 className="text-2xl font-bold mt-4 mb-6">Workspace Settings</h1>
                
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

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b bg-gray-50 font-bold text-gray-700">
                        Members ({members.length})
                    </div>
                    <table className="w-full">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-3 text-left">User ID</th>
                                <th className="px-6 py-3 text-left">Role</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {members.map(member => (
                                <tr key={member.id}>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {member.userId} <span className="text-gray-400 text-xs">(Email pending backend update)</span>
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
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
