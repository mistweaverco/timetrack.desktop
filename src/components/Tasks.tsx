import { FC, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Datafetcher } from './../lib/Datafetcher';
import { removeActiveClassnameTasks } from './../lib/Utils';
import type { RootState } from './Store'
import { useAppDispatch, useAppSelector } from './Store/hooks'
import { replaceTask, replaceTasks, appendTask, deleteTask } from './Store/slices/tasks'
import { replaceTaskDefinitions } from './Store/slices/taskDefinitions'
import { setSelectedTask, removeSelectedTask } from './Store/slices/selectedTask'
import { appendActiveTask, replaceActiveTask } from './Store/slices/activeTasks'
import { ModalConfirm } from './ModalConfirm';
import { EditTaskModal } from './EditTaskModal';
import { TimerComponent } from './TimerComponent';
import { TimeInputComponent } from './TimeInputComponent';

type Props = {
  selectedProject: {
    name: string | null
  },
  activeTasks: ActiveTask[],
  tasks: DBTask[]
}

type WrappedTimerComponentProps = {
  task: DBTask
}

const Component: FC<Props> = ({ selectedProject, activeTasks, tasks }) => {
  const dispatch = useAppDispatch();
  const tasksDefinitions = useAppSelector((state) => state.taskDefinitions.value)
  const selectedTask = useAppSelector((state) => state.selectedTask.value)
  const [useModalConfirm, setModalConfirm] = useState(null)
  const [useModalEdit, setModalEdit] = useState(null)
  const useModalEditRef = useRef(null)

  const WrappedTimerComponent: FC<WrappedTimerComponentProps> = ({ task }) => {
    const activeTask = activeTasks.find((at) => at.name === task.name && at.project_name === task.project_name && at.date === task.date)
    if (activeTask) {
      return (
        <div>Task is running</div>
      )
    } else {
      return <TimerComponent task={task} />
    }
  }

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const task = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      project_name: selectedProject.name as string,
      seconds: parseInt(formData.get('seconds') as string),
      date: new Date().toISOString().split('T')[0]
    }
    const rpcResult = await window.electron.addTask({
      name: task.name,
      description: task.description,
      project_name: task.project_name,
      seconds: task.seconds,
    })
    if (rpcResult.success) {
      dispatch(appendTask(task))
    }
  }

  const onTaskStartClick = async (evt: React.MouseEvent) => {
    evt.preventDefault();
    // TODO we have this kind of .find often, maybe we can refactor it
    // and find a better way to reuse it
    const task = tasks.find((t) => t.name === selectedTask.name && t.project_name === selectedTask.project_name && t.date === selectedTask.date)
    if (task) {
      const rpcResult = await window.electron.startActiveTask({
        name: task.name,
        project_name: task.project_name,
        description: task.description,
        date: task.date,
        seconds: task.seconds
      })
      if (rpcResult.success) {
        dispatch(appendActiveTask({
          name: task.name,
          project_name: task.project_name,
          description: task.description,
          date: task.date,
          seconds: task.seconds,
          isActive: true
        }))
      }
    }
  }

  const onTaskEditCallback = async (status: boolean) => {
    if (status) {
      const form = useModalEditRef.current.querySelector('form') as HTMLFormElement;
      const formData = new FormData(form);
      const task = {
        name: selectedTask.name,
        description: formData.get('description') as string,
        project_name: selectedTask.project_name as string,
        seconds: parseInt(formData.get('seconds') as string, 10),
        date: selectedTask.date
      }
      const rpcResult = await window.electron.editTask({
        name: task.name,
        description: task.description,
        project_name: task.project_name,
        seconds: task.seconds,
        date: task.date
      })

      if (rpcResult.success) {
        const activeTask = activeTasks.find((at) => at.name === task.name && at.project_name === task.project_name && at.date === task.date)
        if (activeTask) {
          dispatch(replaceActiveTask({
            name: rpcResult.name,
            oldname: rpcResult.name,
            project_name: rpcResult.project_name,
            description: rpcResult.description,
            date: rpcResult.date,
            seconds: rpcResult.seconds,
            isActive: activeTask.isActive
          }))
        }
        dispatch(replaceTask({
          name: rpcResult.name,
          oldname: rpcResult.name,
          seconds: rpcResult.seconds,
          project_name: rpcResult.project_name,
          date: rpcResult.date,
          description: rpcResult.description,
        }))
      }
    }
    setModalEdit(null)
  }

  const onTaskEditClick = async (evt: React.MouseEvent) => {
    evt.preventDefault();
    const task = tasks.find((t) => t.name === selectedTask.name && t.project_name === selectedTask.project_name && t.date === selectedTask.date)
    if (task) {
      setModalEdit(<EditTaskModal callback={onTaskEditCallback} useRef={useModalEditRef} task={task} />)
    }
  }

  const onConfirmCallback = async (status: boolean) => {
    if (status) {
      const task = tasks.find((t) => t.name === selectedTask.name && t.project_name === selectedTask.project_name && t.date === selectedTask.date)
      if (task) {
        // TODO make sure task is not running on the backend
        const rpcResult = await window.electron.deleteTask({
          name: task.name,
          project_name: task.project_name,
          date: task.date
        })
        if (rpcResult.success) {
          dispatch(deleteTask({ name: task.name, project_name: task.project_name, date: task.date }));
          dispatch(removeSelectedTask());
          // TODO fix
          // dirty hack to update
          window.location.reload()
        }
      }
    }
    setModalConfirm(null)
  }

  const onTaskDeleteClick = async (evt: React.MouseEvent) => {
    evt.preventDefault();
    setModalConfirm(<ModalConfirm message="Are you sure you want to delete this task?" callback={onConfirmCallback} />)
  }

  const fetchTaskDefinitions = async () => {
    if (!selectedProject.name) return;
    const td = await Datafetcher.getTaskDefinitions(selectedProject.name);
    dispatch(replaceTaskDefinitions(td))
  }

  const fetchTasks = async () => {
    if (!selectedProject.name) return;
    const t = await Datafetcher.getTasksToday(selectedProject.name);
    dispatch(replaceTasks(t))
  }

  const onTaskSelect = async (evt: React.MouseEvent) => {
    const target = evt.target as HTMLDivElement
    const root = target.closest('[data-name]') as HTMLDivElement
    const name = root.dataset.name as string
    removeActiveClassnameTasks();
    root.classList.add('is-active');
    dispatch(setSelectedTask({
      name: name,
      seconds: parseInt(root.dataset.seconds as string, 10),
      project_name: root.dataset.projectName as string,
      date: root.dataset.date as string
    }))
  }

  const ButtonWrapperComponent: FC = ({ children }) => {
    const activeTask = activeTasks.find((at) => at.name === selectedTask.name && at.project_name === selectedTask.project_name && at.date === selectedTask.date)
    if (activeTask) {
      return <>
        <article className="message is-warning">
          <div className="message-header">
            <p>Warning</p>
          </div>
          <div className="message-body">
            Task is currently active,
            you need to stop it to perform a delete action.
          </div>
        </article>
        <button className="button is-warning m-1" onClick={onTaskEditClick}>Edit</button>
      </>
    } else {
      return <>
        <button className="button is-primary m-1" onClick={onTaskStartClick}>Start</button>
        <button className="button is-warning m-1" onClick={onTaskEditClick}>Edit</button>
        <button className="button is-danger m-1" onClick={onTaskDeleteClick}>Delete</button>
      </>
    }
  }

  useEffect(() => {
    fetchTaskDefinitions();
    fetchTasks();
  }, [selectedProject])

  const emptyDummyTask: DBTask = {
    name: "",
    description: "",
    project_name: "",
    seconds: 0,
    date: ""
  }

  if (tasksDefinitions.length) {
    return <>
      {useModalConfirm}
      {useModalEdit}
      <section className="section">
        <h1 className="title">Tasks</h1>
        <h2 className="subtitle">All available Tasks for a given project</h2>
        <div className="fixed-grid has-3-cols">
          <div className="grid">
            <div className="cell">
              <nav className="panel">
                <p className="panel-heading">New</p>
                <form onSubmit={onFormSubmit} className="p-4">
                  <div className="field">
                    <label className="label">Task Defintion</label>
                    <div className="control">
                      <div className="select">
                        <select name="name">
                          {tasksDefinitions.map((td, idx: number) => <option key={idx}>{td.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="field">
                    <label className="label">Task Description</label>
                    <div className="control">
                      <textarea name="description" className="textarea" placeholder="Task Description"></textarea>
                    </div>
                  </div>
                  <div className="field">
                    <label className="label">Task Duration</label>
                    <div className="control">
                      <TimeInputComponent task={emptyDummyTask} />
                    </div>
                  </div>
                  <div className="field">
                    <div className="control">
                      <button className="button is-primary" type="submit">Add Task</button>
                    </div>
                  </div>
                </form>
              </nav>
            </div>

            {tasks.length ?
              <div className="cell">
                <nav className="panel">
                  <p className="panel-heading">Today</p>
                  <div data-tasks-list>
                    {tasks.map((task, idx: number) => {
                      return <div key={idx} data-name={task.name} data-description={task.description} data-seconds={task.seconds} data-project-name={task.project_name} data-date={task.date} onClick={onTaskSelect} className="panel-block">
                        <span className="panel-icon">
                          <i className="fas fa-book" aria-hidden="true"></i>
                        </span>
                        <div className="grid has-1-cols">
                          <div className="columns">
                            <div className="column">
                              <p data-task-name className="bd-notification is-info">{task.name}</p>
                            </div>
                          </div>
                        </div>
                        <div className="grid has-2-cols">
                          <div className="columns">
                            <div className="column">
                              <WrappedTimerComponent task={task} />
                            </div>
                            <div className="column">
                              <p data-task-date className="bd-notification is-info">{task.date}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    })}
                  </div>
                </nav>
              </div>
            : null}

            { selectedTask.name !== null ?
              <div data-task-actions-container className="cell">
                <nav className="panel">
                  <p className="panel-heading">Actions</p>
                  <form data-buttons className="p-4">
                    <div className="field">
                      <div data-buttons className="control">
                        <ButtonWrapperComponent />
                      </div>
                    </div>
                  </form>
                </nav>
              </div>
            : null }

          </div>
        </div>
      </section>
    </>;
  } else {
    return null;
  }
};

const mapStateToProps = (state: RootState) => {
  return {
    selectedProject: state.selectedProject.value,
    activeTasks: state.activeTasks.value,
    tasks: state.tasks.value
  }
}
const connected = connect(mapStateToProps)(Component);
export const Tasks = connected

