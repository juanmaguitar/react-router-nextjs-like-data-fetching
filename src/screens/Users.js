import React from 'react';
import { Link, Route } from 'react-router-dom';

import UserDetail from './UserDetail';
import HttpStatus from '../components/HttpStatus';
import withSSR from '../hoc/withSSR';

const friends = [
  { id: '12342', name: 'Brent' },
  { id: '124234', name: 'Jared' },
];

class Users extends React.Component {

  static getInitialData({ match, req, res }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          friends,
          currentRoute: match.pathname,
        });
      }, 500);
    });
  }

  render() {
    const { isLoading, friends, error } = this.props;
    const hasFriends = !!friends && friends.length > 0;

    if (isLoading) {
      // route wide loading...
      return (
        <div>
          <h1>Loading...</h1>
          <div>...</div>
        </div>
      );
    }

    if (error) {
      return (
        <HttpStatus statusCode={500}>
          <div>
            <h1>Error</h1>
            <pre>
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        </HttpStatus>
      );
    }

    return (
      <div>
        <Route
          path="/users/:id"
          exact
          render={ routeProps =>
            <UserDetail
              { ...routeProps }
              person={
                hasFriends &&
                this.props.friends.find(p => p.id === routeProps.match.params.id)
              }
            />}
        />

        <Route
          path="/users"
          exact
          render={() => {
            return (
              <div>
                <h1>Users</h1>
                {
                  hasFriends &&
                  this.props.friends.map(t =>
                    <Link
                      key={t.id}
                      to={`/users/${t.id}`}
                      style={{ display: 'block', marginBottom: '.5rem' }}
                    >
                      {t.name}
                    </Link>
                  )
                }
                <Link
                  key="404"
                  to={`/users/asdf;lkjasdf`}
                  style={{ display: 'block', marginBottom: '.5rem' }}
                >
                  Not Found Route (404)
                </Link>
                <span
                  style={{
                    display: 'block',
                    fontSize: 12,

                    color: '#999',
                    fontWeight: 800,
                  }}
                >
                  (server rendered if on initial render)
                </span>
              </div>
            );
          }}
        />
      </div>
    );
  }
}

export default withSSR(Users);
