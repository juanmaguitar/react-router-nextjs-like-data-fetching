import React from 'react';
import debug from '../utils/log'
const log = debug('withSSR')


// This is a Higher Order Component that abstracts duplicated data fetching
// on the server and client.
export default function SSR(Page) {

  class SSR extends React.Component {
    static getInitialData(ctx) {
      // Need to call the wrapped components getInitialData if it exists
      return Page.getInitialData
        ? Page.getInitialData(ctx)
        : Promise.resolve(null);
    }

    constructor(props) {
      super(props);
      this.state = {
        data: props.initialData,
        isLoading: false,
      };
      this.ignoreLastFetch = false;
    }

    componentDidMount() {
      if (!this.state.data) {
        this.fetchData();
      }
    }

    componentWillUnmount() {
      this.ignoreLastFetch = true;
    }

    fetchData = async () => {
      // if this.state.data is null, that means that the we are on the client.
      // To get the data we need, we just call getInitialData again on mount.
      if (!this.ignoreLastFetch) {
        log(`${SSR.displayName}: fetchData → refetching from the client...`);
        this.setState({ isLoading: true });
        try {
          const data = await this.constructor.getInitialData({ match: this.props.match })
          this.setState(
            { data, isLoading: false },
            () => log(`${SSR.displayName}: fetchData → this.state → ` + JSON.stringify(this.state))
          )
        }
        catch (error) {
          this.setState(state => ({
            data: { error },
            isLoading: false,
          }))
        }
      }
    };

    render() {
      // Flatten out all the props.
      const { initialData, ...rest } = this.props;

      //  if we wanted to create an app-wide error component,
      //  we could also do that here using <HTTPStatus />. However, it is
      //  more flexible to leave this up to the Routes themselves.
      //
      // if (rest.error && rest.error.code) {
      //   <HttpStatus statusCode={rest.error.code || 500}>
      //     {/* cool error screen based on status code */}
      //   </HttpStatus>
      // }

      return (
        <Page
          {...rest}
          refetch={this.fetchData}
          isLoading={this.state.isLoading}
          {...this.state.data}
        />
      );
    }
  }

  SSR.displayName = `SSR(${getDisplayName(Page)})`;
  return SSR;
}

// This make debugging easier. Components will show as SSR(MyComponent) in
// react-dev-tools.
function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
