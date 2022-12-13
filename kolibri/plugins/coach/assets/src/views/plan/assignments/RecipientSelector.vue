<template>

  <div>
    <!-- Entire class -->
    <KCheckbox
      :value="true"
      :currentValue="entireClassIsSelected"
      :disabled="disabled"
      :indeterminate="!entireClassIsSelected"
      @change="selectEntireClass()"
    >
      <KLabeledIcon
        :label="coachString('entireClassLabel')"
        icon="classes"
      />
    </KCheckbox>

    <!-- TODO: add a small space (5px?)/tab before the below groups -->
    <div
    class="nested-checkboxes">
      <!-- Learner groups
        :indeterminate="groupPartiallySelected(group)"
        -->
      <KCheckbox
        v-for="group in groups"
        :key="group.id"
        :checked="groupIsSelected(group)"
        :disabled="disabled"
        @change="toggleGroup($event, group)"
      >
        <KLabeledIcon
          :label="group.name"
          icon="group"
        />
      </KCheckbox>

      <!-- Individual learners -->
      <IndividualLearnerSelector
        :isVisible="individualSelectorIsVisible"
        :selectedGroupIds="selectedGroupIds"
        :selectedLearnerIds.sync="selectedLearnerIds"
        :targetClassId="classId"
        :indeterminate="allLearnersSelected"
        :disabled="disabled"
        @togglevisibility="toggleIndividualSelector"
      />
    </div>
  </div>

</template>


<script>

  import every from 'lodash/every';
  import { coachStringsMixin } from '../../common/commonCoachStrings';
  import IndividualLearnerSelector from './IndividualLearnerSelector';

  export default {
    name: 'RecipientSelector',
    components: { IndividualLearnerSelector },
    mixins: [coachStringsMixin],
    props: {
      // Needs to equal [classId] if entire class is selected
      // Otherwise, [groupId_1, groupId_2] for individual Learner Groups
      value: {
        type: Array,
        required: true,
      },
      // Array of objects, each with (group) 'id' and 'name'
      groups: {
        type: Array,
        required: true,
        validator(value) {
          return every(value, val => val.name && val.id);
        },
      },
      // For the 'Entire Class' option
      classId: {
        type: String,
        required: true,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      initialAdHocLearners: {
        type: Array,
        required: false,
        default: new Array(),
      },
    },
    data() {
      console.log("DATA CHAMNGE");
      return {
        // Determines whether the individual learner table is visible.
        // Is initially open if item is assigned to individuals.
        individualSelectorIsVisible: this.initialAdHocLearners.length > 0,
        // This is .sync'd with IndividualLearnerSelector, but not with AssignmentDetailsModal
        // which recieves updates via handler in watch.selectedLearnerIds
        selectedLearnerIds: [...this.initialAdHocLearners],
        // Determines whether the group's checkbox is checked and affects which
        // learners are selectable in IndividualLearnerSelector
        selectedGroupIds: this.value.filter(id => id !== this.classId),

      };
    },
    computed: {
      entireClassIsSelected() {
        // todo change
        return this.selectedLearnerIds.length === 0 && this.selectedGroupIds.length === 0;
      },
      currentCollectionIds() {
        if (this.entireClassIsSelected) {
          return [this.classId];
        } else {
          return this.selectedGroupIds;
        }
      },
    },
    watch: {
      selectedLearnerIds(newVal) {
        console.log("UPDATE SELECTED LEARNER IDS");
        console.log(newVal);
        console.log(this.selectedLearnerIds);
        this.selectedLearnerIds = newVal;
        this.$emit('updateLearners', newVal);
        // console.log(this);
        // this.indeterminate = "indeterminate";
      },
      currentCollectionIds(newVal) {
        // console.log("UPDATE CURRENT COLLECTION IDS");
        // console.log(newVal);
        this.$emit('input', newVal);
      },
    },
    methods: {
      toggleIndividualSelector(isChecked) {
        this.logData();
        if (!isChecked) {
          this.clearLearnerIds();
        } else {
          this.individualSelectorIsVisible = true;
        }
      },
      groupIsSelected({ id }) {
        return this.value.includes(id);
      },
      // groupPartiallySelected({ id }) {
      //   return this.
      // },
      allLearnersSelected() {
        return false;
      },
      clearLearnerIds() {
        this.selectedLearnerIds = [];
        this.individualSelectorIsVisible = false;
      },
      selectEntireClass() {
        this.logData();
        console.log("SELECTING ENTIRE CLASS");
        console.log(this);
        console.log(this.indeterminate);
        // console.log(this);

        // deselect entire class if this is not empty
        if (this.selectedLearnerIds.length > 0) {
          this.clearLearnerIds();
          this.selectedGroupIds = [];
        }
        // this.indeterminate = "indeterminate";
      },
      toggleGroup(isChecked, { id }) {
        this.logData();
        if (isChecked) {
          this.selectedGroupIds.push(id);
        } else {
          this.selectedGroupIds = this.selectedGroupIds.filter(groupId => groupId !== id);
        }
      },
      logData() {
        console.log(this);
        console.log("individualSelectorIsVisible");
        console.log(this.individualSelectorIsVisible);
        console.log(this.initialAdHocLearners.length > 0);
        console.log("selectedLearnerIds");
        console.log(this.initialAdHocLearners);
        console.log(this.selectedLearnerIds);
        console.log([...this.initialAdHocLearners].length);
        console.log("selectedGroupIds");
        console.log(this.value.filter(id => id !== this.classId));
        console.log(this.value.filter(id => id !== this.classId).length);
      }
    },
  };

</script>


<style lang="scss" scoped>
.nested-checkboxes {
  margin-left: 32px;
}
</style>
