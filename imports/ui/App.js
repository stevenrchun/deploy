/**
 * Created by stevenchun on 6/8/16.
 */
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import {createContainer } from 'meteor/react-meteor-data';

import { Tasks } from '../api/tasks.js';

import Task from './Task.js';
import AccountsUIWrapper from './AccountsUIWrapper.js';

// App component - represents the whole app
class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hideCompleted: false,

        };
    }

    handleSubmit(event){
        event.preventDefault(); // Don't know what this does

        const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

        /*
        Tasks.insert({
            text,
            createdAt: new Date(),
            owner: Meteor.userId(),  //_id of logged in user
            username: Meteor.user().username, // username of logged in user
        });
        */
        Meteor.call('tasks.insert', text);

        ReactDOM.findDOMNode(this.refs.textInput).value = '';
    }

    toggleHideCompleted() {
        this.setState({
            hideCompleted: !this.state.hideCompleted,
        });
    }

    renderTasks() {
        let filteredTasks = this.props.tasks;
        if (this.state.hideCompleted){
            filteredTasks = filteredTasks.filter(task => !task.checked); //anonymous function, not sure how it works. Not mission critical
        }

        return filteredTasks.map((task) => { //another anonymous function,  replaces tasks with filtered tasks
            const currentUserId = this.props.currentUser && this.props.currentUser._id; //likely only triggers if currentUser is true
            const showPrivateButton = task.owner === currentUserId;

            return (
                 <Task key={task._id} task={task} showPrivateButton={showPrivateButton} />
             );

        });
    }
    render() {
        return (
            <div className="container">
                <header>
                    <h1>Todo List</h1>
                    <label className="hide-completed">
                        <input
                            type="checkbox"
                            readOnly
                            checked={this.state.hideCompleted}
                            onClick={this.toggleHideCompleted.bind(this)}
                            />
                            Hide Completed Tasks
                        </label>
                    
                    <AccountsUIWrapper/>

                    { this.props.currentUser ?
                        <form className="new-task" onSubmit={this.handleSubmit.bind(this)}>
                            <input
                                type="text"
                                ref="textInput"
                                placeholder="Type to add new tasks"
                            />
                        </form> : ''
                    }
                </header>

                <ul>
                    {this.renderTasks()}
                </ul>
            </div>
        );
    }

}

App.propTypes = {
    tasks: PropTypes.array.isRequired,
};

export default createContainer(() => {
    Meteor.subscribe('tasks');
    return {
        tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(), //figure out this sort black magic
        incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
        currentUser: Meteor.user(),
    };
}, App)