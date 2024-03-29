/*
 *
 * HomePage
 *
 */
/* eslint-disable */
import React from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { bindActionCreators, compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import PropTypes from 'prop-types';
import { get, isEmpty, upperFirst } from 'lodash';
import cn from 'classnames';

import {
  Button,
  InputText as Input,
  auth,
  validateInput,
} from 'strapi-helper-plugin';

import Block from '../../components/HomePageBlock';
import Sub from '../../components/Sub';

import { selectPlugins } from '../App/selectors';

import injectReducer from '../../utils/injectReducer';
import injectSaga from '../../utils/injectSaga';

import BlockLink from './BlockLink';
import CommunityContent from './CommunityContent';
import CreateContent from './CreateContent';
import SocialLink from './SocialLink';
import WelcomeContent from './WelcomeContent';

import { getArticles, onChange, submit } from './actions';
import makeSelectHomePage from './selectors';
import reducer from './reducer';
import saga from './saga';
import styles from './styles.scss';

const FIRST_BLOCK = [
  {
    title: {
      id: 'app.components.HomePage.welcome',
    },
    content: () => <WelcomeContent />,
  },
  {
    title: {
      id: 'app.components.HomePage.create',
    },
    content: () => <CreateContent />,
  },
];

const FIRST_BLOCK_LINKS = [
];

const SECOND_BLOCK = {
  title: {
    id: 'app.components.HomePage.community',
  },
  content: () => <CommunityContent />,
};

const SOCIAL_LINKS = [
];

export class HomePage extends React.PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  state = { errors: [] };

  componentDidMount() {
    this.props.getArticles();
  }

  handleSubmit = e => {
    e.preventDefault();
    const errors = validateInput(
      this.props.homePage.body.email,
      { required: true },
      'email'
    );
    this.setState({ errors });

    if (isEmpty(errors)) {
      return this.props.submit();
    }
  };

  showFirstBlock = () =>
    get(this.context.plugins, 'content-manager.leftMenuSections.0.links', [])
      .length === 0;

  renderButton = () => {
    /* eslint-disable indent */
    const data = this.showFirstBlock()
      ? {
          className: styles.homePageTutorialButton,
          href:
            'https://strapi.io/documentation/getting-started/quick-start.html#_3-create-a-content-type',
          id: 'app.components.HomePage.button.quickStart',
          primary: true,
        }
      : {
          className: styles.homePageBlogButton,
          id: 'app.components.HomePage.button.blog',
          href: 'https://blog.strapi.io/',
          primary: false,
        };
    /* eslint-enable indent */

    return (
      <a href={data.href} target="_blank">
        <Button className={data.className} primary={data.primary}>
          <FormattedMessage id={data.id} />
        </Button>
      </a>
    );
  };

  render() {
    const {
      homePage: { articles, body },
    } = this.props;

    const WELCOME_AGAIN_BLOCK = [
      {
        title: {
          id: 'app.components.HomePage.welcome.again',
        },
        name: upperFirst(`${get(auth.getUserInfo(), 'username')}!`),
        content: () => <WelcomeContent hasContent />,
      },
    ];

    return (
      <div className={cn('container-fluid', styles.containerFluid)}>
        <Helmet title="Home Page" />
        <div className="row">
          <div className="col-md-8 col-lg-8">
            <Block>
              {this.showFirstBlock() &&
                FIRST_BLOCK.map((value, key) => (
                  <Sub
                    key={key}
                    {...value}
                    underline={key === 0}
                    bordered={key === 0}
                  />
                ))}
              {!this.showFirstBlock() &&
                WELCOME_AGAIN_BLOCK.concat(articles).map((value, key) => (
                  <Sub
                    key={key}
                    {...value}
                    bordered={key === 0}
                    style={key === 1 ? { marginBottom: '33px' } : {}}
                    underline={key === 0}
                  />
                ))}
              {this.renderButton()}
              <div className={styles.homePageFlex}>
                {FIRST_BLOCK_LINKS.map((value, key) => (
                  <BlockLink {...value} key={key} />
                ))}
              </div>
            </Block>
            <Block>
              <Sub {...SECOND_BLOCK} />
              <div className={styles.homePageFlex}>
                <div
                  className="row"
                  style={{ width: '100%', marginRight: '0' }}
                >
                  {SOCIAL_LINKS.map((value, key) => (
                    <SocialLink key={key} {...value} />
                  ))}
                </div>
                <div className={styles.newsLetterWrapper}>
                  <div>
                    <FormattedMessage id="app.components.HomePage.newsLetter" />
                  </div>
                  <form onSubmit={this.handleSubmit}>
                    <div className={cn(styles.homePageForm, 'row')}>
                      <div className="col-md-12">
                        <Input
                          value={body.email}
                          onChange={this.props.onChange}
                          name=""
                          placeholder="johndoe@gmail.com"
                          error={!isEmpty(this.state.errors)}
                        />
                        <FormattedMessage id="app.components.HomePage.cta">
                          {message => <button type="submit">{message}</button>}
                        </FormattedMessage>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </Block>
          </div>
        </div>
      </div>
    );
  }
}

HomePage.contextTypes = {
  plugins: PropTypes.object,
};

HomePage.propTypes = {
  getArticles: PropTypes.func.isRequired,
  homePage: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  homePage: makeSelectHomePage(),
  plugins: selectPlugins(),
});

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      getArticles,
      onChange,
      submit,
    },
    dispatch
  );
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
);

const withReducer = injectReducer({ key: 'homePage', reducer });
const withSaga = injectSaga({ key: 'homePage', saga });

// export default connect(mapDispatchToProps)(HomePage);
export default compose(
  withReducer,
  withSaga,
  withConnect
)(HomePage);
