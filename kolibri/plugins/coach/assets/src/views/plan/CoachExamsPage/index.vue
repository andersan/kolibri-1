<template>

  <CoachAppBarPage
    :authorized="userIsAuthorized"
    authorizedRole="adminOrCoach"
    :showSubNav="true"
  >

    <KPageContainer>
      <PlanHeader />

      <div class="filter-and-button">
        <!-- Hidden temporarily per https://github.com/learningequality/kolibri/issues/6174
          <KSelect
            v-model="statusSelected"
            :label="coreString('showAction')"
            :options="statusOptions"
            :inline="true"
          />
          -->
        <!-- Remove this div - it makes sure the [NEW LESSON] button stays right-aligned
              while the above <KSelect> is hidden
          -->
        <div>&nbsp;</div>
        <KButtonGroup v-if="practiceQuizzesExist">
          <KButton
            primary
            hasDropdown
            appearance="raised-button"
            :text="coachString('newQuizAction')"
          >
            <template #menu>
              <KDropdownMenu
                :options="dropdownOptions"
                class="options-btn"
                @select="handleSelect"
              />
            </template>
          </KButton>
        </KButtonGroup>
        <KRouterLink
          v-else
          :primary="true"
          appearance="raised-button"
          :to="newExamRoute"
          :text="coachString('newQuizAction')"
        />
      </div>
      <CoreTable>
        <template #headers>
          <th>{{ coachString('titleLabel') }}</th>
          <th>{{ coachString('recipientsLabel') }}</th>
          <th class="center-text">
            {{ coachString('statusLabel') }}
          </th>
        </template>
        <template #tbody>
          <transition-group
            tag="tbody"
            name="list"
          >
            <tr
              v-for="exam in filteredExams"
              :key="exam.id"
            >
              <td>
                <KRouterLink
                  :to="$router.getRoute('QuizSummaryPage', { quizId: exam.id })"
                  appearance="basic-link"
                  :text="exam.title"
                  icon="quiz"
                />
              </td>

              <td>
                <Recipients
                  :groupNames="getRecipientNamesForExam(exam)"
                  :hasAssignments="exam.assignments.length > 0"
                />
              </td>

              <td class="button-col center-text core-table-button-col">
                <!-- Open quiz button -->
                <KButton
                  v-if="!exam.active && !exam.archive"
                  :text="coachString('openQuizLabel')"
                  appearance="flat-button"
                  @click="showOpenConfirmationModal = true; modalQuizId = exam.id"
                />
                <!-- Close quiz button -->
                <KButton
                  v-if="exam.active && !exam.archive"
                  :text="coachString('closeQuizLabel')"
                  appearance="flat-button"
                  @click="showCloseConfirmationModal = true; modalQuizId = exam.id;"
                />
                <!-- Closed quiz label -->
                <div v-if="exam.archive">
                  {{ coachString('quizClosedLabel') }}
                </div>
              </td>

            </tr>
          </transition-group>
        </template>
      </CoreTable>

      <p v-if="!exams.length">
        {{ $tr('noExams') }}
      </p>
      <!--       <p
          v-else-if="statusSelected.value === coachString('activeQuizzesLabel') &&
            !activeExams.length"
        >
          {{ $tr('noActiveExams') }}
        </p>
        <p
          v-else-if=" statusSelected.value === coachString('inactiveQuizzesLabel') &&
            !inactiveExams.length"
        >
          {{ $tr('noInactiveExams') }}
        </p> -->

      <!-- Modals for Close & Open of quiz from right-most column -->
      <KModal
        v-if="showOpenConfirmationModal"
        :title="coachString('openQuizLabel')"
        :submitText="coreString('continueAction')"
        :cancelText="coreString('cancelAction')"
        @cancel="showOpenConfirmationModal = false"
        @submit="handleOpenQuiz(modalQuizId)"
      >
        <div>{{ coachString('openQuizModalDetail') }}</div>
      </KModal>
      <KModal
        v-if="showCloseConfirmationModal"
        :title="coachString('closeQuizLabel')"
        :submitText="coreString('continueAction')"
        :cancelText="coreString('cancelAction')"
        @cancel="showCloseConfirmationModal = false"
        @submit="handleCloseQuiz(modalQuizId)"
      >
        <div>{{ coachString('closeQuizModalDetail') }}</div>
      </KModal>
    </KPageContainer>
  </CoachAppBarPage>

</template>


<script>

  import CoreTable from 'kolibri.coreVue.components.CoreTable';
  import commonCoreStrings from 'kolibri.coreVue.mixins.commonCoreStrings';
  import { ExamResource } from 'kolibri.resources';
  import plugin_data from 'plugin_data';
  import { PageNames } from '../../../constants';
  import commonCoach from '../../common';
  import CoachAppBarPage from '../../CoachAppBarPage';
  import PlanHeader from '../../plan/PlanHeader';

  export default {
    name: 'CoachExamsPage',
    components: {
      CoreTable,
      CoachAppBarPage,
      PlanHeader,
    },
    mixins: [commonCoach, commonCoreStrings],
    data() {
      return {
        // statusSelected: {
        //   label: this.coachString('allQuizzesLabel'),
        //   value: this.coachString('allQuizzesLabel'),
        // },
        showOpenConfirmationModal: false,
        showCloseConfirmationModal: false,
      };
    },
    computed: {
      sortedExams() {
        return this._.orderBy(this.exams, ['date_created'], ['desc']);
      },
      practiceQuizzesExist() {
        return plugin_data.practice_quizzes_exist;
      },
      // Hidden temporarily per https://github.com/learningequality/kolibri/issues/6174
      // Uncomment this once we use the filters again.
      /*
        statusOptions() {
          return [
            {
              label: this.coachString('allQuizzesLabel'),
              value: this.coachString('allQuizzesLabel'),
            },
            {
              label: this.coachString('activeQuizzesLabel'),
              value: this.coachString('activeQuizzesLabel'),
            },
            {
              label: this.coachString('inactiveQuizzesLabel'),
              value: this.coachString('inactiveQuizzesLabel'),
            },
          ];
        },
        */
      // activeExams() {
      //   return this.sortedExams.filter(exam => exam.active === true);
      // },
      // inactiveExams() {
      //   return this.sortedExams.filter(exam => exam.active === false);
      // },
      filteredExams() {
        // const filter = this.statusSelected.label;
        // if (filter === this.coachString('activeQuizzesLabel')) {
        //   return this.activeExams;
        // } else if (filter === this.coachString('inactiveQuizzesLabel')) {
        //   return this.inactiveExams;
        // }
        return this.sortedExams;
      },
      newExamRoute() {
        return { name: PageNames.EXAM_CREATION_ROOT };
      },
      dropdownOptions() {
        return [
          { label: this.$tr('newQuiz'), value: 'MAKE_NEW_QUIZ' },
          { label: this.$tr('selectQuiz'), value: 'SELECT_QUIZ' },
        ];
      },
    },
    methods: {
      handleOpenQuiz(quizId) {
        let promise = ExamResource.saveModel({
          id: quizId,
          data: {
            active: true,
            date_activated: new Date(),
          },
          exists: true,
        });

        return promise
          .then(() => {
            this.$store.dispatch('classSummary/refreshClassSummary');
            this.showOpenConfirmationModal = false;
            this.$store.dispatch('createSnackbar', this.coachString('quizOpenedMessage'));
          })
          .catch(() => {
            this.$store.dispatch('createSnackbar', this.coachString('quizFailedToOpenMessage'));
          });
      },
      handleCloseQuiz(quizId) {
        let promise = ExamResource.saveModel({
          id: quizId,
          data: {
            archive: true,
            date_archived: new Date(),
          },
          exists: true,
        });

        return promise
          .then(() => {
            this.$store.dispatch('classSummary/refreshClassSummary');
            this.showCloseConfirmationModal = false;
            this.$store.dispatch('createSnackbar', this.coachString('quizClosedMessage'));
          })
          .catch(() => {
            this.$store.dispatch('createSnackbar', this.coachString('quizFailedToCloseMessage'));
          });
      },
      handleSelect({ value }) {
        const nextRoute = {
          MAKE_NEW_QUIZ: PageNames.EXAM_CREATION_ROOT,
          SELECT_QUIZ: PageNames.EXAM_CREATION_PRACTICE_QUIZ,
        }[value];
        this.$router.push(this.$router.getRoute(nextRoute));
      },
    },
    $trs: {
      noExams: {
        message: 'You do not have any quizzes',
        context: 'Message displayed when there are no quizzes within a class.',
      },
      // noActiveExams: 'No active quizzes',
      // noInactiveExams: {
      //   message: 'No inactive quizzes',
      //   context:
      //     "Inactive quizzes are ones that are no longer in progress.
      //     When the coach presses the 'End quiz' button, the quiz
      //passes from 'active' to 'inactive'.",
      // },
      newQuiz: {
        message: 'Create new quiz',
        context: "Title of the screen launched from the 'New quiz' button on the 'Plan' tab.\n",
      },
      selectQuiz: {
        message: 'Select quiz',
        context:
          "Practice quizzes are pre-made quizzes, that don't require the curation work on the part of the coach. Selecting a practice quiz refers to importing a ready-to-use quiz.",
      },
    },
  };

</script>


<style lang="scss" scoped>

  .filter-and-button {
    display: flex;
    flex-wrap: wrap-reverse;
    justify-content: space-between;

    button {
      align-self: flex-end;
    }
  }

  .center-text {
    text-align: center;
  }

  .button-col {
    vertical-align: middle;
  }

</style>
