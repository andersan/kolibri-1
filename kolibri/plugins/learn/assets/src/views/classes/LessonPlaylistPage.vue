<template>

  <LearnAppBarPage
    :appBarTitle="learnString('learnLabel')"
  >
    <div id="main" role="main">
      <KBreadcrumbs :items="breadcrumbs" :ariaLabel="learnString('classesAndAssignmentsLabel')" />
      <section class="lesson-details">
        <div>
          <ContentIcon
            kind="lesson"
            class="lesson-icon"
          />
          <h1 dir="auto" class="title">
            {{ currentLesson.title }}
            <ProgressIcon
              v-if="lessonHasResources"
              class="progress-icon"
              :progress="lessonProgress"
            />
          </h1>
        </div>
        <div v-if="currentLesson.description !== ''">
          <h3>{{ $tr('teacherNote') }}</h3>
          <p dir="auto">
            {{ currentLesson.description }}
          </p>
        </div>
      </section>

      <section v-if="contentNodes && contentNodes.length" class="content-cards">
        <HybridLearningLessonCard
          v-for="content in contentNodes"
          :key="content.id"
          :content="content"
          class="content-card"
          :isMobile="windowIsSmall"
          :link="genContentLink(content)"
        />
        <p v-if="!lessonHasResources" class="no-resources-message">
          {{ $tr('noResourcesInLesson') }}
        </p>
      </section>
    </div>
  </LearnAppBarPage>

</template>


<script>

  import { mapMutations, mapState } from 'vuex';
  import sumBy from 'lodash/sumBy';
  import KBreadcrumbs from 'kolibri-design-system/lib/KBreadcrumbs';
  import responsiveWindowMixin from 'kolibri.coreVue.mixins.responsiveWindowMixin';
  import ProgressIcon from 'kolibri.coreVue.components.ProgressIcon';
  import ContentIcon from 'kolibri.coreVue.components.ContentIcon';
  import commonCoreStrings from 'kolibri.coreVue.mixins.commonCoreStrings';
  import genContentLink from '../../utils/genContentLink';
  import { PageNames, ClassesPageNames } from '../../constants';
  import commonLearnStrings from './../commonLearnStrings';
  import LearnAppBarPage from './../LearnAppBarPage';
  import HybridLearningLessonCard from './../HybridLearningLessonCard';

  export default {
    name: 'LessonPlaylistPage',
    metaInfo() {
      return {
        title: this.currentLesson.title,
      };
    },
    components: {
      KBreadcrumbs,
      HybridLearningLessonCard,
      ContentIcon,
      ProgressIcon,
      LearnAppBarPage,
    },
    mixins: [commonCoreStrings, commonLearnStrings, responsiveWindowMixin],
    computed: {
      ...mapState('lessonPlaylist', ['contentNodes', 'currentLesson']),
      lessonHasResources() {
        return this.contentNodes.length > 0;
      },
      lessonProgress() {
        if (this.lessonHasResources) {
          // HACK: Infer the Learner's progress by summing the progress_fractions
          // on all the ContentNodes
          const total = sumBy(this.contentNodes, cn => cn.progress_fraction || 0);
          if (total === 0) {
            return null;
          }
          return total / this.contentNodes.length;
        }

        return undefined;
      },
      breadcrumbs() {
        return this.currentLesson && this.currentLesson.classroom
          ? [
              {
                text: this.coreString('homeLabel'),
                link: { name: PageNames.HOME },
              },
              {
                text: this.coreString('classesLabel'),
                link: { name: ClassesPageNames.ALL_CLASSES },
              },
              {
                text: this.currentLesson.classroom.name,
                link: {
                  name: ClassesPageNames.CLASS_ASSIGNMENTS,
                  params: { classId: this.currentLesson.classroom.id },
                },
              },
              {
                text: this.currentLesson.title,
              },
            ]
          : [];
      },
      backRoute() {
        return this.$route.name;
      },
      context() {
        const context = {};
        if (this.currentLesson && this.currentLesson.classroom) {
          context.lessonId = this.currentLesson.id;
          context.classId = this.currentLesson.classroom.id;
        } else if (this.isLibraryPage || this.pageName === PageNames.TOPICS_TOPIC_SEARCH) {
          Object.assign(context, this.$route.query);
        }
        return context;
      },
    },
    beforeDestroy() {
      /* If we are going anywhere except for content we unset the lesson */

      if (this.$route.name !== PageNames.TOPICS_CONTENT) {
        this.SET_CURRENT_LESSON({});
      }
    },
    methods: {
      ...mapMutations('lessonPlaylist', ['SET_CURRENT_LESSON']),
      genContentLink(content) {
        return genContentLink(
          content.id,
          this.topicId,
          content.is_leaf,
          this.backRoute,
          this.context
        );
      },
    },
    $trs: {
      noResourcesInLesson: {
        message: 'There are no resources in this lesson',
        context:
          "This text displays in the learner's 'Lessons' section if the coach has not added any resources to the lesson.",
      },
      teacherNote: 'Coach note',
    },
  };

</script>


<style lang="scss" scoped>

  .lesson-details {
    margin-bottom: 32px;
  }

  .title {
    display: inline-block;
  }

  .content-cards {
    max-width: 100%;
  }

  .content-card {
    margin-bottom: 16px;
  }

  .no-resources-message {
    padding: 48px 0;
    font-weight: bold;
    text-align: center;
  }

  .lesson-icon {
    display: inline-block;
    margin-right: 0.5em;
    font-size: 1.8em;

    /deep/ .ui-icon {
      margin-bottom: 12px;
      vertical-align: middle;
    }
  }

  .progress-icon {
    display: inline-block;
    margin-right: 0.5em;
    font-size: 1.8em;

    /deep/ .ui-icon {
      margin-top: 4px;
      vertical-align: middle;
    }
  }

</style>
