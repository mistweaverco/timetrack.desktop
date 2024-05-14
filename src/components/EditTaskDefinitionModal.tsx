import React, { FC, ReactNode } from 'react';

interface BaseLayoutProps {
  children?: ReactNode;
  name: string;
  useRef: React.RefObject<HTMLDivElement>;
  callback?: (status: boolean) => void;
}

export const EditTaskDefinitionModal: FC<BaseLayoutProps> = ({ callback, name, useRef }) => {
  const onEditButtonClick = (evt: React.MouseEvent) => {
    evt.preventDefault();
    if (callback) {
      callback(true);
    }
  }

  const onCancelButtonClick = (evt: React.MouseEvent) => {
    evt.preventDefault();
    if (callback) {
      callback(false);
    }
  }

  return <>
    <div className="modal is-active" ref={useRef}>
      <div className="modal-background"></div>
      <div className="modal-card">
        <form>
          <header className="modal-card-head">
            <p className="modal-card-title">Edit Task Definition</p>
          </header>
          <section className="modal-card-body">
            <div className="field">
              <label className="label">Task Definition Name</label>
              <div className="control">
                <input type="hidden" name="oldname" defaultValue={name} />
                <input className="input" name="name" required defaultValue={name} type="text" placeholder="Task Definition Name" />
              </div>
            </div>
          </section>
          <footer className="modal-card-foot">
            <div data-buttons className="buttons">
              <button className="button is-warning" onClick={onEditButtonClick}>Edit</button>
              <button className="button" onClick={onCancelButtonClick}>Cancel</button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  </>;
};

