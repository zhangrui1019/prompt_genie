import { Fragment, useEffect, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, PlusIcon, UsersIcon } from '@heroicons/react/20/solid';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function WorkspaceSwitcher() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { workspaces, currentWorkspace, fetchWorkspaces, switchWorkspace, createWorkspace } = useWorkspaceStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newWsName, setNewWsName] = useState('');

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newWsName.trim()) return;
      await createWorkspace(newWsName);
      setNewWsName('');
      setIsCreating(false);
  };

  const personalWs = { id: null, name: t('common.personal_workspace', { defaultValue: '个人空间' }) };
  const selected = currentWorkspace || personalWs;

  return (
    <div className="relative mb-4 px-2">
      <Listbox value={selected} onChange={(val: any) => switchWorkspace(val.id)}>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-gray-800/60 border border-gray-700 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/50 sm:text-sm">
            <span className="block truncate font-bold text-white flex items-center gap-2">
                {selected.id ? <UsersIcon className="w-4 h-4 text-blue-400"/> : <span className="w-4 h-4 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 text-xs font-bold">P</span>}
                {selected.name}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg bg-gray-800/80 border border-gray-700 py-1 text-base shadow-lg ring-1 ring-black/50 focus:outline-none sm:text-sm z-50">
              {/* Personal Workspace Option */}
              <Listbox.Option
                  key="personal"
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-blue-900/30 text-blue-300' : 'text-gray-300'
                    }`
                  }
                  value={personalWs}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {personalWs.name}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>

              {/* Team Workspaces */}
              {workspaces.map((ws) => (
                <Listbox.Option
                  key={ws.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-blue-900/30 text-blue-300' : 'text-gray-300'
                    }`
                  }
                  value={ws}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {ws.name}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
              
              <div className="border-t border-gray-700 mt-1 pt-1">
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-blue-900/30 flex items-center gap-2"
                    onClick={(e) => { e.stopPropagation(); setIsCreating(true); }}
                  >
                      <PlusIcon className="w-4 h-4" />
                      {t('common.create')} Workspace
                  </button>
              </div>
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>

      {/* Quick Access to Settings */}
      {currentWorkspace && (
          <div className="mt-1 px-1 flex justify-end">
              <button 
                onClick={() => navigate(`/workspace/${currentWorkspace.id}/settings`)}
                className="text-xs text-gray-400 hover:text-blue-400 underline"
              >
                  {t('common.manage')} Members
              </button>
          </div>
      )}

      {/* Create Modal (Simple inline for MVP) */}
      {isCreating && (
          <div className="absolute top-12 left-0 w-64 bg-gray-800/80 shadow-xl border border-gray-700 rounded-lg p-3 z-50">
              <form onSubmit={handleCreate}>
                  <label className="block text-xs font-bold text-gray-300 mb-1">{t('common.new')} Workspace Name</label>
                  <input 
                    autoFocus
                    className="w-full border border-gray-700 bg-gray-900 rounded px-2 py-1 text-sm mb-2 text-white"
                    value={newWsName}
                    onChange={e => setNewWsName(e.target.value)}
                    placeholder="e.g. Marketing Team"
                  />
                  <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setIsCreating(false)} className="text-xs text-gray-400">{t('common.cancel')}</button>
                      <button type="submit" className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-1 rounded">{t('common.create')}</button>
                  </div>
              </form>
          </div>
      )}
    </div>
  );
}
